import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface UsuarioLogado {
  nome: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE';
  clienteId?: number;
}

interface AuthContextType {
  usuario: UsuarioLogado | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, telefone: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await api.post('/auth/login', { email, senha });
    const data = res.data;
    setToken(data.token);
    const u: UsuarioLogado = { nome: data.nome, email: data.email, role: data.role, clienteId: data.clienteId };
    setUsuario(u);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(u));
  };

  const register = async (nome: string, email: string, telefone: string, senha: string) => {
    const res = await api.post('/auth/register', { nome, email, telefone, senha });
    const data = res.data;
    setToken(data.token);
    const u: UsuarioLogado = { nome: data.nome, email: data.email, role: data.role, clienteId: data.clienteId };
    setUsuario(u);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
