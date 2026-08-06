import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import type { User } from '../types/auth';

interface AuthContextType {
  isAuth: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      setIsAuth(true);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setIsAuth(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const { default: AuthService } = await import('../services/AuthService');
      await AuthService.logout();
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
