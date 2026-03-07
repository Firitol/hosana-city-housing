const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    requireAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, requireAuth = true } = options;

  // ✅ Safe localStorage access
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('hosana_token') 
    : null;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requireAuth && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // ✅ Handle auth errors
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hosana_token');
        localStorage.removeItem('hosana_user');
      }
      throw new Error('Unauthorized - please login again');
    }

    // ✅ Handle other HTTP errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // ✅ Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // ✅ Re-throw with helpful message
    if (error instanceof Error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
    throw new Error('Network error - please check your connection');
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<Parameters<typeof apiRequest<T>>[1], "method" | "body">) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: Omit<Parameters<typeof apiRequest<T>>[1], "method" | "body">) => 
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown, options?: Omit<Parameters<typeof apiRequest<T>>[1], "method" | "body">) => 
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: Omit<Parameters<typeof apiRequest<T>>[1], "method" | "body">) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export function isAuthenticated() {
  return typeof window !== 'undefined' && !!localStorage.getItem('hosana_token');
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hosana_token');
    localStorage.removeItem('hosana_user');
  }
}
