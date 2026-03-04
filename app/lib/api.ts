// Web API client for Hosana Housing System
// Uses native fetch (no axios needed) + localStorage (no expo-secure-store)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = true,
  } = options;

  // Get token from localStorage (web equivalent of expo-secure-store)
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('hosana_token') 
    : null;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth header if required and token exists
  if (requireAuth && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // For file uploads, let browser set Content-Type with boundary
      delete requestHeaders['Content-Type'];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle auth errors
    if (response.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hosana_token');
        localStorage.removeItem('hosana_user');
      }
      throw new Error('Unauthorized - please login again');
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse and return response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw network errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error - please check your connection');
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  
  put: <T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  
  upload: <T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: formData }),
};

// Helper: Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('hosana_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Helper: Check if user is authenticated
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('hosana_token');
}

// Helper: Logout (clear storage)
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hosana_token');
  localStorage.removeItem('hosana_user');
  localStorage.removeItem('hosana_locale');
}
