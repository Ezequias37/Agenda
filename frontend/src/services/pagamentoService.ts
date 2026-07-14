import api from './api';
import type { ResumoPagamentos } from '../types';

export const pagamentoService = {
  async obterResumo(): Promise<ResumoPagamentos> {
    const res = await api.get<ResumoPagamentos>('/api/pagamentos/resumo');
    return res.data;
  },
};
