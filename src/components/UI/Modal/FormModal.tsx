import React from 'react';
import Modal from './Modal';
import Button from '../Button';

export interface ModalButtonConfig {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  formId?: string;
  isLoading?: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  buttons?: ModalButtonConfig[];
}

const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  buttons = []
}) => {
  const footer = (
    <>
      {buttons.map((btn, index) => (
        <Button 
          key={index}
          variant={btn.variant || 'primary'} 
          onClick={btn.onClick} 
          type={btn.type || 'button'}
          form={btn.formId}
          isLoading={btn.isLoading}
        >
          {btn.label}
        </Button>
      ))}
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="600px">
      {children}
    </Modal>
  );
};

export default FormModal;
