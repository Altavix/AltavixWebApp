import React, { createContext, useState, type ReactNode, useCallback } from 'react';
import type { MessageType } from '../types/api';

interface ToastState {
  message: string;
  type: MessageType;
  isVisible: boolean;
}

interface ToastContextType {
  toast: ToastState;
  showToast: (message: string, type: MessageType) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: MessageType) => {
    setToast({ message, type, isVisible: true });
    
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};
