import api from './api';
import type { CasoSucesso, CasoPublico } from '../types';

export const casoSucessoService = {
  async criar(agendamentoId: number, titulo: string, descricao: string, foto: File): Promise<CasoSucesso> {
    const formData = new FormData();
    formData.append('agendamentoId', String(agendamentoId));
    formData.append('titulo', titulo);
    if (descricao) formData.append('descricao', descricao);
    formData.append('foto', foto);

    const res = await api.post<CasoSucesso>('/api/casos', formData, {
      // Remove o Content-Type padrão para o navegador definir o boundary do multipart automaticamente.
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  async listarPendentes(): Promise<CasoSucesso[]> {
    const res = await api.get<CasoSucesso[]>('/api/casos/pendentes');
    return res.data;
  },

  async listarMeus(): Promise<CasoSucesso[]> {
    const res = await api.get<CasoSucesso[]>('/api/casos/meus');
    return res.data;
  },

  async aprovar(id: number): Promise<CasoSucesso> {
    const res = await api.patch<CasoSucesso>(`/api/casos/${id}/aprovar`);
    return res.data;
  },

  async rejeitar(id: number): Promise<void> {
    await api.delete(`/api/casos/${id}`);
  },

  async listarPublicos(empresaId: number): Promise<CasoPublico[]> {
    const res = await api.get<CasoPublico[]>('/api/casos/publicos', { params: { empresaId } });
    return res.data;
  },
};
