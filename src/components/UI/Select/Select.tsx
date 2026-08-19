import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/components/UI/Select.css';
import type { KeyValue } from '../../../types/common';

interface SelectProps {
  options: KeyValue[];
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

  const handleOptionClick = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  const selectedLabel = options.find(o => o.key === selectedValue)?.value;

  return (
    <div className={`input-group ${selectedValue ? 'has-value' : ''}`} ref={containerRef}>
      <div 
        className={`select-container base-input-control ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="select-text">
          {selectedLabel || (!label && <span className="select-placeholder">{placeholder}</span>)}
        </div>
        <div className="select-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {label && <label className="floating-label">{label}</label>}

      {isOpen && (
        <div className="select-dropdown">
          {options.length === 0 ? (
            <div className="select-empty">Немає доступних варіантів</div>
          ) : (
            options.map(option => (
              <div 
                key={option.key} 
                className={`select-option ${selectedValue === option.key ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.key)}
              >
                <span>{option.value}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
