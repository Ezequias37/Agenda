import { useState, useEffect } from 'react';
import type { Agendamento, CreateAgendamentoDTO } from '../types';
import { agendamentoService } from '../services/agendamentoService';

interface UseAgendamentosReturn {
  agendamentos: Agendamento[];
  loading: boolean;
  error: string | null;
  createAgendamento: (data: CreateAgendamentoDTO) => Promise<Agendamento>;
  deleteAgendamento: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAgendamentos(): UseAgendamentosReturn {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendamentoService.listAgendamentos();
      setAgendamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const createAgendamento = async (data: CreateAgendamentoDTO) => {
    try {
      setError(null);
      const criado = await agendamentoService.createAgendamento(data);
      await fetchAgendamentos();
      return criado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
      throw err;
    }
  };

  const deleteAgendamento = async (id: number) => {
    try {
      setError(null);
      await agendamentoService.cancelarAgendamento(id);
      await fetchAgendamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento');
      throw err;
    }
  };

  return { agendamentos, loading, error, createAgendamento, deleteAgendamento, refetch: fetchAgendamentos };
}
