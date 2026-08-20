import React from 'react';
import '../../styles/components/UI/Input.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', value, defaultValue, ...props }) => {
  const hasValue = value !== undefined && value !== '' && value !== null 
                || defaultValue !== undefined && defaultValue !== '' && defaultValue !== null;

  return (
    <div className={`input-group ${hasValue ? 'has-value' : ''} ${className}`}>
      <textarea 
        className={`base-input-control textarea-control ${error ? 'error' : ''}`} 
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

export default Textarea;
