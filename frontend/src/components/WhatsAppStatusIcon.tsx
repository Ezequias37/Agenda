import type { Agendamento } from '../types';

interface WhatsAppStatusIconProps {
  agendamento: Agendamento;
}

/**
 * Ícone que indica se a notificação de WhatsApp relevante para o status
 * atual do agendamento já foi enviada (confirmação, lembrete ou
 * cancelamento).
 */
export function WhatsAppStatusIcon({ agendamento }: WhatsAppStatusIconProps) {
  let enviado: boolean;
  let rotulo: string;

  if (agendamento.status === 'CANCELADO') {
    enviado = !!agendamento.whatsappCancelamentoEnviado;
    rotulo = 'Aviso de cancelamento';
  } else if (agendamento.whatsappLembreteEnviado) {
    enviado = true;
    rotulo = 'Lembrete';
  } else {
    enviado = !!agendamento.whatsappConfirmacaoEnviado;
    rotulo = 'Confirmação';
  }

  return (
    <span
      title={`${rotulo} por WhatsApp: ${enviado ? 'enviada' : 'não enviada'}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 600,
        color: enviado ? '#15803d' : '#9ca3af',
      }}
    >
      💬 {enviado ? '✅' : '⚪'}
    </span>
  );
}
