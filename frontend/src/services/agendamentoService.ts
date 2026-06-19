import api from './api';
import type { Agendamento, CreateAgendamentoDTO } from '../types';

export const agendamentoService = {
  async listAgendamentos(): Promise<Agendamento[]> {
    const response = await api.get<Agendamento[]>('/agendamentos');
    return response.data;
  },

  async createAgendamento(data: CreateAgendamentoDTO): Promise<Agendamento> {
    const response = await api.post<Agendamento>('/agendamentos', data);
    return response.data;
  },

  async deleteAgendamento(id: number): Promise<void> {
    await api.delete(`/agendamentos/${id}`);
  },
};
