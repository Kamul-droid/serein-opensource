import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

type AuthContextValue = {
  isAuthenticated: boolean;
  accessToken?: string;
  user?: { id: string; email: string; name?: string };
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'serein_access_token';
const REFRESH_TOKEN_KEY = 'serein_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | undefined>(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) || undefined
  );
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    () => localStorage.getItem(REFRESH_TOKEN_KEY) || undefined
  );
  const [user, setUser] = useState<AuthContextValue['user']>();

  useEffect(() => {
    const syncFromStorage = () => {
      setAccessToken(localStorage.getItem(ACCESS_TOKEN_KEY) || undefined);
      setRefreshToken(localStorage.getItem(REFRESH_TOKEN_KEY) || undefined);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) {
        syncFromStorage();
      }
    };
    const handleCustom = () => syncFromStorage();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('serein:auth-updated', handleCustom as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('serein:auth-updated', handleCustom as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login({ email, password });
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setUser(result.user);
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await api.register({ email, password, name });
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setUser(result.user);
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  };

  const logout = () => {
    if (refreshToken) {
      api.logout(refreshToken).catch(() => null);
    }
    setAccessToken(undefined);
    setRefreshToken(undefined);
    setUser(undefined);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      accessToken,
      user,
      login,
      register,
      logout,
    }),
    [accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
