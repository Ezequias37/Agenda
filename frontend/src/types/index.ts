export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface CreateClienteDTO {
  nome: string;
  email: string;
  telefone: string;
}

export interface Agendamento {
  id: number;
  cliente: Cliente;
  dataHora: string;
  descricao: string;
  status: 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO';
}

export interface CreateAgendamentoDTO {
  cliente: { id: number };
  dataHora: string;
  descricao: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
