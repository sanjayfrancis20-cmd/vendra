'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@/lib/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'customer') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLogin: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch auth session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'customer' = 'customer') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const quickLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@store.com', 'admin123');
    } else {
      await login('user@store.com', 'user123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
