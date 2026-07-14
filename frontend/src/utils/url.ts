const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Resolve uma URL de arquivo retornada pela API (ex: "/uploads/x.png") em uma URL absoluta. */
export function resolveUploadUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}
