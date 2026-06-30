import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, TOKEN_KEY, USER_KEY } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'ADMIN') {
          setUser(parsed);
        } else {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = data.data;

    if (newUser.role !== 'ADMIN') {
      throw new Error('This portal is for EthioCred Administrators only.');
    }

    persistSession(newToken, newUser);
    return newUser;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, isLoading, login, logout]
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
