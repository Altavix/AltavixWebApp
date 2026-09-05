import React, { useState } from 'react';
import '../../styles/components/UI/Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', value, defaultValue, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const hasValue = value !== undefined && value !== '' && value !== null 
                || defaultValue !== undefined && defaultValue !== '' && defaultValue !== null;

  return (
    <div className={`input-group ${hasValue ? 'has-value' : ''} ${className}`}>
      <input 
        type={inputType}
        className={`base-input-control ${error ? 'error' : ''} ${isPasswordType ? 'has-toggle' : ''}`} 
        placeholder={label ? " " : props.placeholder}
        value={value}
        defaultValue={defaultValue}
        {...props} 
      />
      {label && <label className="floating-label">{label}</label>}
      {isPasswordType && (
        <button 
          type="button" 
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          title={showPassword ? "Приховати пароль" : "Показати пароль"}
        >
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
