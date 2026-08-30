import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cb_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cb_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password });
    localStorage.setItem('cb_token', data.token);
    localStorage.setItem('cb_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout notification to backend failed:', err?.message);
    } finally {
      localStorage.removeItem('cb_token');
      localStorage.removeItem('cb_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
