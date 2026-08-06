import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/components/UI/Select.css';

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  selectedValue: string;
  onChange: (selected: string) => void;
  placeholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  placeholder = 'Виберіть варіант...',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  const selectedLabel = options.find(o => o.value === selectedValue)?.label;

  return (
    <div className="select-wrapper" ref={containerRef}>
      {label && <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>{label}</label>}
      <div 
        className={`select-container input-field ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="select-text">
          {selectedLabel || <span className="select-placeholder">{placeholder}</span>}
        </div>
        <div className="select-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          {options.length === 0 ? (
            <div className="select-empty">Немає доступних варіантів</div>
          ) : (
            options.map(option => (
              <div 
                key={option.value} 
                className={`select-option ${selectedValue === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.value)}
              >
                <span>{option.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
