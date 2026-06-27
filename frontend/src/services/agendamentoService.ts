import api from './api';
import type { Agendamento, CreateAgendamentoDTO, SlotDTO } from '../types';

export const agendamentoService = {
  async listAgendamentos(): Promise<Agendamento[]> {
    const response = await api.get<Agendamento[]>('/api/agendamentos');
    return response.data;
  },

  async getMeusAgendamentos(): Promise<Agendamento[]> {
    const response = await api.get<Agendamento[]>('/api/agendamentos/meus');
    return response.data;
  },

  async createAgendamento(data: CreateAgendamentoDTO): Promise<Agendamento> {
    const response = await api.post<Agendamento>('/api/agendamentos', data);
    return response.data;
  },

  async cancelarAgendamento(id: number): Promise<Agendamento> {
    const response = await api.patch<Agendamento>(`/api/agendamentos/${id}/cancelar`);
    return response.data;
  },

  async deleteAgendamento(id: number): Promise<void> {
    await api.delete(`/api/agendamentos/${id}`);
  },

  async getHorariosDisponiveis(data: string, procedimentoId: string): Promise<SlotDTO[]> {
    const response = await api.get<SlotDTO[]>('/api/agendamentos/horarios-disponiveis', {
      params: { data, procedimentoId },
    });
    return response.data;
  },
};
