import api from './api';
import type { Cliente, CreateClienteDTO } from '../types';

export const clientService = {
  async listClientes(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  async createCliente(data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data;
  },
};
