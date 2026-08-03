import React from 'react';
import Modal from './Modal';
import Button from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  confirmText = 'Yes', 
  cancelText = 'No',
  isDestructive = false
}) => {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button 
        variant={isDestructive ? 'primary' : 'primary'} 
        onClick={() => {
          onConfirm();
          onClose();
        }}
        style={isDestructive ? { backgroundColor: '#d32f2f' } : {}}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="400px">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
        <div style={{ color: isDestructive ? '#d32f2f' : 'var(--color-primary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
