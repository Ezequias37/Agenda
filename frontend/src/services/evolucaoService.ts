import api from './api';
import type { EvolucaoCliente } from '../types';

export const evolucaoService = {
  async adicionar(agendamentoId: number, descricao: string, foto: File): Promise<EvolucaoCliente> {
    const formData = new FormData();
    formData.append('agendamentoId', String(agendamentoId));
    if (descricao) formData.append('descricao', descricao);
    formData.append('foto', foto);

    const res = await api.post<EvolucaoCliente>('/api/evolucao', formData, {
      // Remove o Content-Type padrão para o navegador definir o boundary do multipart automaticamente.
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  async listarPorCliente(clienteId: number): Promise<EvolucaoCliente[]> {
    const res = await api.get<EvolucaoCliente[]>(`/api/evolucao/cliente/${clienteId}`);
    return res.data;
  },

  async listarPorAgendamento(agendamentoId: number): Promise<EvolucaoCliente[]> {
    const res = await api.get<EvolucaoCliente[]>(`/api/evolucao/agendamento/${agendamentoId}`);
    return res.data;
  },
};
