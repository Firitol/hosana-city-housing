const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiRequest<T>(endpoint: string, options: { method?: string; headers?: Record<string, string>; body?: any; requireAuth?: boolean } = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, requireAuth = true } = options;
  const token = typeof window !== 'undefined' ? localStorage.getItem('hosana_token') : null;
  const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  if (requireAuth && token) requestHeaders['Authorization'] = `Bearer ${token}`;
  
  const config: RequestInit = { method, headers: requestHeaders };
  if (body && method !== 'GET') config.body = body instanceof FormData ? body : JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('hosana_token');
    localStorage.removeItem('hosana_user');
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return await response.json() as T;
}

export const api = {
  get: <T>(endpoint: string, options?: any) => apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: any) => apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body: any, options?: any) => apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: any) => apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export function isAuthenticated() { return typeof window !== 'undefined' && !!localStorage.getItem('hosana_token'); }
export function logout() { if (typeof window !== 'undefined') { localStorage.removeItem('hosana_token'); localStorage.removeItem('hosana_user'); } }
