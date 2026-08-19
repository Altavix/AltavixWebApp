import React from 'react';
import '../../styles/components/UI/Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', value, defaultValue, ...props }) => {
  const hasValue = value !== undefined && value !== '' && value !== null 
                || defaultValue !== undefined && defaultValue !== '' && defaultValue !== null;

  return (
    <div className={`input-group ${hasValue ? 'has-value' : ''} ${className}`}>
      <input 
        className={`base-input-control ${error ? 'error' : ''}`} 
        placeholder={label ? " " : props.placeholder}
        value={value}
        defaultValue={defaultValue}
        {...props} 
      />
      {label && <label className="floating-label">{label}</label>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
