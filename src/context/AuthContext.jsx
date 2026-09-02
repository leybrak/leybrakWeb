// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);

  const login = async (email, password) => {
    const res  = await fetch(`${API_URL}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión.');
    }

    localStorage.setItem('admin_token', data.data.token);
    setToken(data.data.token);
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  // Envoltorio de fetch que agrega el token y maneja sesiones expiradas
  const authFetch = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
    }

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'Ocurrió un error.');
    }
    return data;
  };

  const value = { isAuthenticated: !!token, login, logout, authFetch };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
