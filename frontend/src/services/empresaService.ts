import api from './api';
import type { Empresa } from '../types';

export async function obterConfigEmpresa(): Promise<Empresa> {
  const res = await api.get('/api/empresa/config');
  return res.data;
}

export interface AtualizarConfigEmpresaPayload {
  nomeFantasia?: string;
  razaoSocial?: string;
  cnpj?: string;
  telefone?: string;
  endereco?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  logo?: File | null;
}

export async function atualizarConfigEmpresa(payload: AtualizarConfigEmpresaPayload): Promise<Empresa> {
  const formData = new FormData();
  if (payload.nomeFantasia !== undefined) formData.append('nomeFantasia', payload.nomeFantasia);
  if (payload.razaoSocial !== undefined) formData.append('razaoSocial', payload.razaoSocial);
  if (payload.cnpj !== undefined) formData.append('cnpj', payload.cnpj);
  if (payload.telefone !== undefined) formData.append('telefone', payload.telefone);
  if (payload.endereco !== undefined) formData.append('endereco', payload.endereco);
  if (payload.corPrimaria !== undefined) formData.append('corPrimaria', payload.corPrimaria);
  if (payload.corSecundaria !== undefined) formData.append('corSecundaria', payload.corSecundaria);
  if (payload.logo) formData.append('logo', payload.logo);

  const res = await api.put('/api/empresa/config', formData, {
    // Remove o Content-Type padrão (application/json) para que o navegador
    // defina automaticamente "multipart/form-data" com o boundary correto.
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}
