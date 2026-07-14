import api from './api';
import type { Procedimento } from '../types';

export const procedimentoService = {
  async listar(): Promise<Procedimento[]> {
    const res = await api.get<Procedimento[]>('/api/procedimentos');
    return res.data;
  },

  async criar(procedimento: Omit<Procedimento, 'id'> & { id?: string }): Promise<Procedimento> {
    const res = await api.post<Procedimento>('/api/procedimentos', procedimento);
    return res.data;
  },

  async atualizar(id: string, procedimento: Omit<Procedimento, 'id'>): Promise<Procedimento> {
    const res = await api.put<Procedimento>(`/api/procedimentos/${id}`, procedimento);
    return res.data;
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/api/procedimentos/${id}`);
  },
};
