import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/components/UI/MultiSelect.css';
import type { KeyValue } from '../../../types/common';

interface MultiSelectProps {
  options: KeyValue[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Виберіть варіанти...',
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

  const handleCheckboxChange = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (selectedValues.some(v => v.toLowerCase() === lowerKey)) {
      onChange(selectedValues.filter(v => v.toLowerCase() !== lowerKey));
    } else {
      onChange([...selectedValues, key]);
    }
  };

  const selectedLabels = selectedValues
    .map(val => options.find(o => o.key.toLowerCase() === val.toLowerCase())?.value)
    .filter(Boolean)
    .join(', ');

  return (
    <div className={`input-group ${selectedValues.length > 0 ? 'has-value' : ''}`} ref={containerRef}>
      <div 
        className={`multiselect-container base-input-control ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="multiselect-text">
          {selectedLabels || (!label && <span className="multiselect-placeholder">{placeholder}</span>)}
        </div>
        <div className="multiselect-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {label && <label className="floating-label">{label}</label>}

      {isOpen && (
        <div className="multiselect-dropdown">
          {options.length === 0 ? (
            <div className="multiselect-empty">Немає доступних варіантів</div>
          ) : (
            options.map(option => (
              <label 
                key={option.key} 
                className="multiselect-option"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.some(v => v.toLowerCase() === option.key.toLowerCase())}
                  onChange={() => handleCheckboxChange(option.key)}
                />
                <span>{option.value}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
