import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@ethiocred/utils';

const TOKEN_KEY = 'ethiocred_token';
const USER_KEY = 'ethiocred_user';

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
        setUser(JSON.parse(storedUser));
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
    persistSession(newToken, newUser);
    return newUser;
  }, [persistSession]);

  const loginWithFayda = useCallback(async (faydaId) => {
    const { data } = await api.post('/auth/login/fayda', { fayda_id: faydaId });
    const { token: newToken, user: newUser } = data.data;
    persistSession(newToken, newUser);
    return newUser;
  }, [persistSession]);

  const register = useCallback(async ({ full_name, fayda_id, email }) => {
    const { data } = await api.post('/auth/register/student', { full_name, fayda_id, email });
    const { token: newToken, user: newUser } = data.data;
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
      loginWithFayda,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, isLoading, login, loginWithFayda, register, logout]
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
