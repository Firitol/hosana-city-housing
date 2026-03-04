'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User { id: string; username: string; role: string; fullName: string; assignedMender?: string; }
interface AuthContextType { user: User | null; token: string | null; login: (token: string, user: User) => void; logout: () => void; isAuthenticated: boolean; isLoading: boolean; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('hosana_token');
    const storedUser = localStorage.getItem('hosana_user');
    if (storedToken && storedUser) { setToken(storedToken); setUser(JSON.parse(storedUser)); }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken); setUser(newUser);
    localStorage.setItem('hosana_token', newToken);
    localStorage.setItem('hosana_user', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('hosana_token');
    localStorage.removeItem('hosana_user');
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token && !!user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
