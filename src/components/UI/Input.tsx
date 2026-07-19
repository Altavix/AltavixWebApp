import React from 'react';
import '../../styles/components/UI/Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
