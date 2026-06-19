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
  cliente: Cliente;
  dataHora: string;
  procedimento: Procedimento;
  status: 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO';
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

export const PROCEDIMENTOS: Procedimento[] = [
  {
    id: 'brz-artificial',
    nome: 'Bronzeamento Artificial (Máquina)',
    preco: 100,
    duracao: '1h30min',
    descricao: 'Sessão de bronzeamento em câmara UV',
    categoria: 'bronzeamento',
  },
  {
    id: 'brz-artificial-banho',
    nome: 'Bronzeamento Artificial + Banho de Lua',
    preco: 110,
    duracao: '1h30min',
    descricao: 'Sessão de bronzeamento em câmara UV + Banho de Lua',
    categoria: 'bronzeamento',
  },
  {
    id: 'brz-natural',
    nome: 'Bronzeamento Natural (Sol)',
    preco: 80,
    duracao: '1h30min',
    descricao: 'Sessão de bronzeamento ao ar livre',
    categoria: 'bronzeamento',
  },
  {
    id: 'brz-natural-banho',
    nome: 'Bronzeamento Natural + Banho de Lua',
    preco: 90,
    duracao: '1h30min',
    descricao: 'Sessão de bronzeamento ao ar livre + Banho de Lua',
    categoria: 'bronzeamento',
  },
  {
    id: 'esfoliacao',
    nome: 'Esfoliação Corporal',
    preco: 40,
    duracao: '30min',
    descricao: 'Esfoliação profunda da pele',
    categoria: 'complementar',
  },
  {
    id: 'banho-lua',
    nome: 'Banho de Lua (Descoloração)',
    preco: 40,
    duracao: '20min',
    descricao: 'Descoloração e clareamento dos pelos',
    categoria: 'complementar',
  },
];

export const INFORMACOES_SERVICO = {
  endereco: 'Rua Luciana Teixeira, 57 Esplanada - Araçuaí, MG',
  duracao: '1h30min',
  oQueLevr: [
    '2 toalhas',
    '1 sabonete',
    '1 protetor solar',
    'Garrafinha de água',
  ],
  recomendacoes: [
    'Ir bem alimentada',
    'Evitar banhos quentes no dia do procedimento',
    'Usar roupas claras após o bronzeamento',
  ],
};

