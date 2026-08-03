import React from 'react';
import Modal from './Modal';
import Button from '../Button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  type?: 'info' | 'warning' | 'error';
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttonText = 'OK',
  type = 'info'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default: // info
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const footer = (
    <Button variant="primary" onClick={onClose}>
      {buttonText}
    </Button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="400px">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
        <div>{getIcon()}</div>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>{message}</p>
      </div>
    </Modal>
  );
};

export default AlertModal;
