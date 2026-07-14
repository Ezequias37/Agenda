import api from './api';
import type { Cliente, CreateClienteDTO } from '../types';

export const clientService = {
  async listClientes(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/api/clientes');
    return response.data;
  },

  async createCliente(data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.post<Cliente>('/api/clientes', data);
    return response.data;
  },

  async updateCliente(id: number, data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.put<Cliente>(`/api/clientes/${id}`, data);
    return response.data;
  },

  async deleteCliente(id: number): Promise<void> {
    await api.delete(`/api/clientes/${id}`);
  },

  async uploadFoto(id: number, foto: File): Promise<Cliente> {
    const formData = new FormData();
    formData.append('foto', foto);
    const response = await api.post<Cliente>(`/api/clientes/${id}/foto`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },
};
