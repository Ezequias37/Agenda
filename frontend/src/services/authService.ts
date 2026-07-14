import api from './api';

export const authService = {
  async alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await api.patch('/auth/senha', { senhaAtual, novaSenha });
  },
};
