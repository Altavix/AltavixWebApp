import React from 'react';
import { useToast } from '../../hooks/useToast';
import '../../styles/components/UI/Toast.css';

const Toast: React.FC = () => {
  const { toast } = useToast();

  if (!toast.message && !toast.isVisible) return null;

  const typeClass = `toast-${toast.type}`;
  const visibleClass = toast.isVisible ? 'visible' : '';

  return (
    <div className={`toast-container ${typeClass} ${visibleClass}`}>
      {toast.message}
    </div>
  );
};

export default Toast;
