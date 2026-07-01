'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens, setTokens, clearTokens } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { accessToken } = getTokens();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.data.user);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password) {
    const res = await api.login({ email, password });
    setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    return api.register({ name, email, password });
  }

  async function logout() {
    const { refreshToken } = getTokens();
    try {
      await api.logout(refreshToken);
    } catch {
      // ignore network errors on logout
    }
    clearTokens();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
