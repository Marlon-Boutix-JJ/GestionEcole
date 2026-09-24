import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('admin_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('admin_session');
    }
  }, [user]);

  const register = async ({ nom, prenom, pseudo, password, confirmPassword }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, pseudo, password, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription.');
      }
      setUser(data);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Identifiant ou mot de passe incorrect.');
      }
      setUser(data);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_session');
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
