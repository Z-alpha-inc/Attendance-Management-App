export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
export async function apiFetch<T = any>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers, cache: 'no-store' });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
