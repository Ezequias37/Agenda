import { useState, useEffect } from 'react';
import type { Cliente, CreateClienteDTO } from '../types';
import { clientService } from '../services/clientService';

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  createCliente: (data: CreateClienteDTO) => Promise<void>;
  updateCliente: (id: number, data: CreateClienteDTO) => Promise<void>;
  deleteCliente: (id: number) => Promise<void>;
  uploadFotoCliente: (id: number, foto: File) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.listClientes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const createCliente = async (data: CreateClienteDTO) => {
    try {
      setError(null);
      await clientService.createCliente(data);
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente');
      throw err;
    }
  };

  const updateCliente = async (id: number, data: CreateClienteDTO) => {
    try {
      setError(null);
      await clientService.updateCliente(id, data);
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      throw err;
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      setError(null);
      await clientService.deleteCliente(id);
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover cliente');
      throw err;
    }
  };

  const uploadFotoCliente = async (id: number, foto: File) => {
    try {
      setError(null);
      await clientService.uploadFoto(id, foto);
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto');
      throw err;
    }
  };

  return { clientes, loading, error, createCliente, updateCliente, deleteCliente, uploadFotoCliente, refetch: fetchClientes };
}
