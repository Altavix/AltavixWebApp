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
    const checkAuth = async () => {
      // First check local storage for fast load
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        setIsAuth(true);
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      }
      
      // If no user in local storage, try to authenticate via refresh cookie
      try {
        const { default: axios } = await import('axios');
        const { API_ENDPOINTS, API_BASE_URL } = await import('../config/api');
        
        // This will send the cookies automatically if they exist
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/refresh`, {}, { withCredentials: true });
        
        if (response.data?.messageType === 'success' && response.data.data) {
          const authData = response.data.data;
          const userData: User = {
            id: authData.userId,
            email: authData.email || '',
            role: authData.role,
            name: authData.firstName ? `${authData.firstName} ${authData.lastName || ''}`.trim() : undefined,
            phoneNumber: authData.phoneNumber
          };
          
          setIsAuth(true);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        // No valid session
        console.log('No valid session found via cookies.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
