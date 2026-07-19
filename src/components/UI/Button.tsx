import React from 'react';
import '../../styles/components/UI/Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <span className="loader"></span> : children}
    </button>
  );
};

export default Button;
