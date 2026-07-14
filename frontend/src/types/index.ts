export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  fotoUrl?: string | null;
}

export interface EvolucaoCliente {
  id: number;
  fotoUrl: string;
  descricao: string | null;
  data: string;
  agendamento?: { id: number } | null;
}

export interface CasoSucesso {
  id: number;
  titulo: string;
  descricao: string | null;
  fotoUrl: string;
  aprovado: boolean;
  imagemProntaUrl?: string | null;
  legendaPronta?: string | null;
  dataCriacao: string;
  cliente?: { id: number; nome: string } | null;
  agendamento?: { id: number } | null;
}

export interface CasoPublico {
  id: number;
  titulo: string;
  descricao: string | null;
  imagemUrl: string;
  clienteNome: string | null;
  data: string;
}

export interface EmpresaBranding {
  id: number;
  nomeFantasia: string;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
}

export interface Empresa {
  id: number;
  nomeFantasia: string;
  razaoSocial?: string;
  cnpj?: string;
  telefone?: string;
  endereco?: string;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
  oQueLevar?: string | null;
  recomendacoes?: string | null;
}

export interface EmpresaPublica {
  id: number;
  nomeFantasia: string;
  telefone: string | null;
  endereco: string | null;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
  oQueLevar: string | null;
  recomendacoes: string | null;
}

export interface CreateClienteDTO {
  nome: string;
  email: string;
  telefone: string;
}

export interface Procedimento {
  id: string;
  nome: string;
  preco: number;
  duracao: string;
  descricao: string;
  categoria: 'bronzeamento' | 'complementar';
}

export interface Agendamento {
  id: number;
  cliente: Cliente | null;
  dataHora: string;
  procedimento: Procedimento | null;
  status: 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO';
  whatsappConfirmacaoEnviado?: boolean;
  whatsappLembreteEnviado?: boolean;
  whatsappCancelamentoEnviado?: boolean;
  valor?: number | null;
  pago?: boolean;
  codigoPagamento?: string | null;
  qrCodePix?: string | null;
  pixCopiaECola?: string | null;
  linkPagamento?: string | null;
}

export interface PagamentoResumoItem {
  id: number;
  clienteNome: string | null;
  procedimentoNome: string | null;
  valor: number | null;
  dataHora: string;
}

export interface ResumoPagamentos {
  faturamentoHoje: number;
  faturamentoMes: number;
  faturamentoPorDia: Record<string, number>;
  pagamentos: PagamentoResumoItem[];
}

export interface SlotDTO {
  dataHora: string;
  capacidade: number;
  vagas: number;
  disponivel: boolean;
}

export interface CreateAgendamentoDTO {
  cliente: { id: number };
  dataHora: string;
  procedimento: Procedimento;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

