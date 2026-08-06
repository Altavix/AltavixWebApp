import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/components/UI/MultiSelect.css';

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
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

  const handleCheckboxChange = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = selectedValues
    .map(val => options.find(o => o.value === val)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="multiselect-wrapper" ref={containerRef}>
      {label && <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>{label}</label>}
      <div 
        className={`multiselect-container input-field ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="multiselect-text">
          {selectedLabels || <span className="multiselect-placeholder">{placeholder}</span>}
        </div>
        <div className="multiselect-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="multiselect-dropdown">
          {options.length === 0 ? (
            <div className="multiselect-empty">Немає доступних варіантів</div>
          ) : (
            options.map(option => (
              <label 
                key={option.value} 
                className="multiselect-option"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
