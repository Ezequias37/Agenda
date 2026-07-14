import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { EmpresaBranding } from '../types';

// Identidade visual oficial CLICKAGENDA (fallback padrão white-label)
export const CORES_PADRAO_CLICKAGENDA = {
  corPrimaria: '#4A148C',
  corPrimariaClara: '#7B1FA2',
  corSecundaria: '#00897B',
  corSecundariaClara: '#26A69A',
};

const NOME_PADRAO = 'CLICKAGENDA';
const LOGO_PADRAO = '/logo_clickagenda.svg';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface ThemeContextType {
  branding: EmpresaBranding | null;
  nomeExibicao: string;
  logoExibicao: string;
  setBranding: (branding: EmpresaBranding | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/** Clareia uma cor hex em um determinado fator (0-1), misturando com branco. */
function clarear(hex: string, fator = 0.25): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * fator);
  return `#${[mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function resolveLogoUrl(logoUrl: string | null | undefined): string {
  if (!logoUrl) return LOGO_PADRAO;
  return logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [branding, setBrandingState] = useState<EmpresaBranding | null>(() => {
    const salvo = localStorage.getItem('empresaBranding');
    return salvo ? JSON.parse(salvo) : null;
  });

  useEffect(() => {
    const root = document.documentElement;
    const corPrimaria = branding?.corPrimaria || CORES_PADRAO_CLICKAGENDA.corPrimaria;
    const corSecundaria = branding?.corSecundaria || CORES_PADRAO_CLICKAGENDA.corSecundaria;

    root.style.setProperty('--ca-primary', corPrimaria);
    root.style.setProperty(
      '--ca-primary-light',
      branding?.corPrimaria ? clarear(corPrimaria) : CORES_PADRAO_CLICKAGENDA.corPrimariaClara
    );
    root.style.setProperty('--ca-secondary', corSecundaria);
    root.style.setProperty(
      '--ca-secondary-light',
      branding?.corSecundaria ? clarear(corSecundaria) : CORES_PADRAO_CLICKAGENDA.corSecundariaClara
    );
  }, [branding]);

  const setBranding = (novo: EmpresaBranding | null) => {
    setBrandingState(novo);
    if (novo) localStorage.setItem('empresaBranding', JSON.stringify(novo));
    else localStorage.removeItem('empresaBranding');
  };

  return (
    <ThemeContext.Provider
      value={{
        branding,
        nomeExibicao: branding?.nomeFantasia || NOME_PADRAO,
        logoExibicao: resolveLogoUrl(branding?.logoUrl),
        setBranding,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
