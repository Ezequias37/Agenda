import { useState, useEffect } from 'react';
import type { Cliente, CreateClienteDTO } from '../types';
import { clientService } from '../services/clientService';

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  createCliente: (data: CreateClienteDTO) => Promise<void>;
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

  return { clientes, loading, error, createCliente, refetch: fetchClientes };
}
