import React, { useState, useEffect } from 'react';
import type { CategoryDto } from '../../../types/category';
import type { BrandDto } from '../../../types/brand';
import '../../../styles/components/UI/SidebarFilter.css';

import type { CharacteristicFilterDto } from '../../../types/characteristic';

interface SidebarFilterProps {
  categories: CategoryDto[];
  brands: BrandDto[];
  characteristics: CharacteristicFilterDto[];
  maxPrice: number;
  onFilterChange: (filters: {
    categoryIds: string[];
    brandIds: string[];
    characteristics: Record<string, string[]>;
    minPrice: number;
    maxPrice: number;
  }) => void;
  onClose?: () => void;
}

const SidebarFilter: React.FC<SidebarFilterProps> = ({ 
  categories = [], 
  brands = [], 
  characteristics = [],
  maxPrice,
  onFilterChange,
  onClose
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState<number>(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(maxPrice || 100000);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState(false);
  const [expandedCharacteristics, setExpandedCharacteristics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (maxPrice > 0) {
      setCurrentMaxPrice(maxPrice);
    }
  }, [maxPrice]);

  useEffect(() => {
    onFilterChange({
      categoryIds: selectedCategories,
      brandIds: selectedBrands,
      characteristics: selectedCharacteristics,
      minPrice,
      maxPrice: currentMaxPrice
    });
  }, [selectedCategories, selectedBrands, selectedCharacteristics, minPrice, currentMaxPrice]);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBrandToggle = (id: string) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleCharacteristicToggle = (charId: string, value: string) => {
    setSelectedCharacteristics(prev => {
      const currentValues = prev[charId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [charId]: newValues
      };
    });
  };

  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val <= currentMaxPrice) setMinPrice(val);
  };

  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= minPrice && val <= maxPrice) setCurrentMaxPrice(val);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedCharacteristics({});
    setMinPrice(0);
    setCurrentMaxPrice(maxPrice || 100000);
  };

  // Sort logically or alphabetically
  const sortedCategories = [...(categories || [])].sort((a, b) => a.title.localeCompare(b.title));
  const sortedBrands = [...(brands || [])].sort((a, b) => a.name.localeCompare(b.name));

  const visibleCategories = expandedCategories ? sortedCategories : sortedCategories.slice(0, 4);
  const visibleBrands = expandedBrands ? sortedBrands : sortedBrands.slice(0, 4);

  return (
    <div className="sidebar-filter">
      <div className="filter-section">
        <h3>Ціна</h3>
        <div className="price-inputs">
          <input 
            type="number" 
            value={minPrice} 
            onChange={handleMinPriceInput}
            min={0}
            max={maxPrice}
          />
          <span>-</span>
          <input 
            type="number" 
            value={currentMaxPrice} 
            onChange={handleMaxPriceInput}
            min={0}
            max={maxPrice}
          />
        </div>
        <div className="range-slider">
          <div 
            className="slider-track" 
            style={{ 
             left: `${maxPrice > 0 ? (minPrice / maxPrice) * 100 : 0}%`,
             right: `${maxPrice > 0 ? 100 - (currentMaxPrice / maxPrice) * 100 : 0}%`
            }}
          ></div>
          <input 
            type="range" 
            className="thumb-left"
            min={0} 
            max={maxPrice} 
            value={minPrice} 
            onChange={handleMinPriceInput}
          />
          <input 
            type="range" 
            className="thumb-right"
            min={0} 
            max={maxPrice} 
            value={currentMaxPrice} 
            onChange={handleMaxPriceInput}
          />
        </div>
      </div>

      <div className="filter-section">
        <h3>Бренди</h3>
        <div className="checkbox-list">
          {visibleBrands.map(b => (
            <label key={b.id} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={selectedBrands.includes(b.id)}
                onChange={() => handleBrandToggle(b.id)}
              />
              {b.name}
            </label>
          ))}
        </div>
        {sortedBrands.length > 4 && (
          <button className="expand-btn" onClick={() => setExpandedBrands(!expandedBrands)}>
            {expandedBrands ? 'Менше' : 'Ще'}
          </button>
        )}
      </div>

      <div className="filter-section">
        <h3>Категорії</h3>
        <div className="checkbox-list">
          {visibleCategories.map(c => (
            <label key={c.id} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(c.id)}
                onChange={() => handleCategoryToggle(c.id)}
              />
              {c.title}
            </label>
          ))}
        </div>
        {sortedCategories.length > 4 && (
          <button className="expand-btn" onClick={() => setExpandedCategories(!expandedCategories)}>
            {expandedCategories ? 'Менше' : 'Ще'}
          </button>
        )}
      </div>

      {characteristics.map(char => {
        const isExpanded = expandedCharacteristics[char.id];
        const visibleValues = isExpanded ? char.values : char.values.slice(0, 4);
        
        return (
          <div key={char.id} className="filter-section">
            <h3>{char.name}</h3>
            <div className="checkbox-list">
              {visibleValues.map(val => (
                <label key={val} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={(selectedCharacteristics[char.id] || []).includes(val)}
                    onChange={() => handleCharacteristicToggle(char.id, val)}
                  />
                  {val}
                </label>
              ))}
            </div>
            {char.values.length > 4 && (
              <button 
                className="expand-btn" 
                onClick={() => setExpandedCharacteristics(prev => ({...prev, [char.id]: !prev[char.id]}))}
              >
                {isExpanded ? 'Менше' : 'Ще'}
              </button>
            )}
          </div>
        );
      })}

      <div className="sidebar-filter-actions">
        <button className="btn-secondary" onClick={handleReset}>Скинути</button>
        <button className="btn-primary" onClick={onClose}>Застосувати</button>
      </div>
    </div>
  );
};

export default SidebarFilter;
