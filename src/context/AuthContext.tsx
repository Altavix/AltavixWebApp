import React, { createContext, useState, ReactNode, useEffect } from 'react';

import type { User } from '../types/auth';

interface AuthContextType {
  isAuth: boolean;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Перевіряємо, чи є токен при завантаженні додатку
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuth(true);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  };

  const login = (userData: User, token: string) => {
    const payload = parseJwt(token);
    const role = payload ? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : undefined;
    const enhancedUser = { ...userData, role: role || userData.role };

    setIsAuth(true);
    setUser(enhancedUser);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(enhancedUser));
  };

  const logout = () => {
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
