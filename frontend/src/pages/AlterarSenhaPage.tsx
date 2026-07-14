import { useState } from 'react';
import { authService } from '../services/authService';

export default function AlterarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação não coincide com a nova senha.');
      return;
    }

    setSalvando(true);
    try {
      await authService.alterarSenha(senhaAtual, novaSenha);
      setSucesso(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setErro(err?.response?.data?.erro || 'Erro ao alterar a senha. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: 480 }}>
        <h1 className="page-title">🔒 Alterar Senha</h1>
        <p className="page-subtitle">Troque sua senha de acesso ao sistema</p>

        {erro && <div className="error-box"><strong>Erro</strong>{erro}</div>}
        {sucesso && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            ✅ Senha alterada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="senhaAtual">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? '⏳ Salvando...' : '💾 Alterar senha'}
          </button>
        </form>
      </div>
    </main>
  );
}
