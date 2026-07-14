import { useState, useEffect } from 'react';
import type { Agendamento, Cliente, Procedimento, SlotDTO } from '../types';
import { PROCEDIMENTOS } from '../types';
import { ProcedimentoSelect } from './ProcedimentoSelect';
import { ErrorMessage } from './ErrorMessage';
import { agendamentoService } from '../services/agendamentoService';

interface AgendamentoFormProps {
  clientes?: Cliente[];
  clienteFixo?: number;
  onSubmit?: (data: any) => Promise<Agendamento | void>;
  onSuccess?: (agendamentoCriado?: Agendamento) => void;
}

export function AgendamentoForm({ clientes, clienteFixo, onSubmit, onSuccess }: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);
  const [clienteId, setClienteId] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [slots, setSlots] = useState<SlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState<SlotDTO | null>(null);

  useEffect(() => {
    if (!dataSelecionada || !selectedProcedimento) {
      setSlots([]);
      setSlotSelecionado(null);
      return;
    }
    let ativo = true;
    setLoadingSlots(true);
    setSlotSelecionado(null);
    agendamentoService.getHorariosDisponiveis(dataSelecionada, selectedProcedimento.id)
      .then(data => { if (ativo) setSlots(data); })
      .catch(() => { if (ativo) setSlots([]); })
      .finally(() => { if (ativo) setLoadingSlots(false); });
    return () => { ativo = false; };
  }, [dataSelecionada, selectedProcedimento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProcedimento) { setError('Selecione um procedimento'); return; }
    if (!slotSelecionado) { setError('Selecione um horário disponível'); return; }

    const cId = (clienteFixo != null && clienteFixo > 0) ? clienteFixo : parseInt(clienteId);
    if (clientes != null && (!cId || isNaN(cId))) { setError('Selecione um cliente'); return; }

    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        ...(cId && !isNaN(cId) ? { cliente: { id: cId } } : {}),
        dataHora: slotSelecionado.dataHora,
        procedimento: { id: selectedProcedimento.id },
        status: 'AGENDADO',
      };
      let criado: Agendamento | void;
      if (onSubmit) { criado = await onSubmit(data); }
      else { criado = await agendamentoService.createAgendamento(data as any); }
      setClienteId('');
      setDataSelecionada('');
      setSelectedProcedimento(null);
      setSlots([]);
      setSlotSelecionado(null);
      onSuccess?.(criado ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      {!clienteFixo && clientes && (
        <div className="form-group">
          <label htmlFor="clienteId">👤 Selecione o Cliente</label>
          <select id="clienteId" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
            <option value="">Selecione...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      )}

      <ProcedimentoSelect
        procedimentos={PROCEDIMENTOS}
        selected={selectedProcedimento}
        onChange={proc => { setSelectedProcedimento(proc); setSlotSelecionado(null); setSlots([]); }}
      />

      <div className="form-group">
        <label htmlFor="dataSessao">📅 Data da Sessão</label>
        <input
          id="dataSessao" type="date" min={hoje} value={dataSelecionada} required
          onChange={e => { setDataSelecionada(e.target.value); setSlotSelecionado(null); }}
        />
      </div>

      {dataSelecionada && selectedProcedimento && (
        <div className="form-group">
          <label>🕐 Escolha o Horário</label>
          {loadingSlots ? (
            <p style={{ color: '#888', fontSize: '0.875rem', margin: '0.5rem 0' }}>Buscando horários disponíveis...</p>
          ) : slots.length === 0 ? (
            <p style={{ color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' }}>Sem horários disponíveis nessa data.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {slots.map(slot => {
                const hora = slot.dataHora.substring(11, 16);
                const sel = slotSelecionado?.dataHora === slot.dataHora;
                return (
                  <button key={slot.dataHora} type="button" disabled={!slot.disponivel}
                    onClick={() => setSlotSelecionado(slot)}
                    style={{
                      padding: '0.45rem 0.9rem', borderRadius: 8, fontWeight: sel ? 700 : 400, fontSize: '0.9rem',
                      border: `2px solid ${sel ? '#b45309' : slot.disponivel ? '#68d391' : '#e2e8f0'}`,
                      background: sel ? '#b45309' : slot.disponivel ? '#f0fff4' : '#f7fafc',
                      color: sel ? '#fff' : slot.disponivel ? '#276749' : '#a0aec0',
                      cursor: slot.disponivel ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {hora}
                    {slot.vagas > 1 && <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>({slot.vagas} vagas)</span>}
                    {!slot.disponivel && <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>lotado</span>}
                  </button>
                );
              })}
            </div>
          )}
          {slotSelecionado && (
            <p style={{ color: '#b45309', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
              ✅ {slotSelecionado.dataHora.substring(11, 16)} — prazo de cancelamento: até 1h antes
            </p>
          )}
        </div>
      )}

      <button type="submit" className="btn btn-primary"
        disabled={loading || !selectedProcedimento || !slotSelecionado}>
        {loading ? 'Aguarde...' : '✅ Confirmar Agendamento'}
      </button>
    </form>
  );
}
