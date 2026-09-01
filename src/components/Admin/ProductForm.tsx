import React, { useState, useEffect } from 'react';
import type { ProductVm, ProductCharacteristicDto } from '../../types/product';
import CategoryService from '../../services/CategoryService';
import CharacteristicService from '../../services/CharacteristicService';
import type { CharacteristicDto } from '../../types/characteristic';
import BrandService from '../../services/BrandService';
import type { BrandDto } from '../../types/brand';
import Input from '../UI/Input';
import Button from '../UI/Button';
import ImageUploader from '../UI/ImageUploader/ImageUploader';
import FormModal from '../UI/Modal/FormModal';
import CategoryForm from './CategoryForm';
import type { CategoryFormData } from './CategoryForm';
import { useFetching } from '../../hooks/useFetching';
import MultiSelect from '../UI/Select/MultiSelect';
import '../../styles/components/Admin/ProductForm.css';

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  priceCoin: number;
  categoryIds: string[];
  images?: string[];
  inStock: boolean;
  enabled: boolean;
  brandId?: string;
  characteristics: ProductCharacteristicDto[];
}

interface ProductFormProps {
  initialData?: ProductVm | null;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
}

const ensureBase64Prefix = (base64Str: string) => {
  if (base64Str.startsWith('http') || base64Str.startsWith('data:image')) {
    return base64Str;
  }
  return `data:image/jpeg;base64,${base64Str}`;
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceCoin, setPriceCoin] = useState(initialData?.priceCoin?.toString() || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  
  const [inStock, setInStock] = useState<boolean>(initialData?.inStock ?? true);
  const [enabled, setEnabled] = useState<boolean>(initialData?.enabled ?? true);
  
  const [images, setImages] = useState<string[]>((initialData?.images || []).map(ensureBase64Prefix));
  const [imagesModified, setImagesModified] = useState(false);
  const [productCharacteristics, setProductCharacteristics] = useState<ProductCharacteristicDto[]>(initialData?.characteristics || []);
  
  const [categories, setCategories] = useState<{key: string, value: string}[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [brandId, setBrandId] = useState<string>(initialData?.brandId || '');
  const [brands, setBrands] = useState<BrandDto[]>([]);

  // Characteristic addition state
  const [availableCharacteristics, setAvailableCharacteristics] = useState<CharacteristicDto[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [charValue, setCharValue] = useState<string>('');
  const [isCharPopoverOpen, setIsCharPopoverOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getOptions();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const [fetchCharacteristicsAction] = useFetching(async () => {
    return await CharacteristicService.getAll(true);
  });

  const loadCharacteristics = async () => {
    try {
      const response = await fetchCharacteristicsAction();
      let chars: CharacteristicDto[] = [];
      
      if (response?.data) {
        const d = response.data as any;
        if (Array.isArray(d)) {
          chars = d;
        } else if (d.characteristics) {
          chars = d.characteristics;
        } else if (d?.data?.characteristics) {
          chars = d.data.characteristics;
        }
      } else if ((response as any)?.characteristics) {
        chars = (response as any).characteristics;
      } else if (Array.isArray(response)) {
        chars = response;
      }
      
      setAvailableCharacteristics(chars.filter((c: CharacteristicDto) => c.enabled));
    } catch (err) {
      console.error("Failed to load characteristics", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await BrandService.getAll(true);
      if (response?.data) {
        const d = response.data as any;
        if (Array.isArray(d)) {
          setBrands(d.filter((b: any) => b.enabled));
        } else if (d.brands) {
          setBrands(d.brands.filter((b: any) => b.enabled));
        } else if (d?.data?.brands) {
          setBrands(d.data.brands.filter((b: any) => b.enabled));
        }
      }
    } catch (error) {
      console.error("Failed to fetch brands", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    loadCharacteristics();
    fetchBrands();
  }, []);

  const handleImagesChange = (newImagesBase64: string[]) => {
    setImages(prev => [...prev, ...newImagesBase64]);
    setImagesModified(true);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagesModified(true);
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      price: parseInt(price) || 0,
      priceCoin: parseInt(priceCoin) || 0,
      categoryIds: selectedCategories,
      images: imagesModified ? images : undefined,
      inStock,
      enabled,
      brandId: brandId || undefined,
      characteristics: productCharacteristics
    });
  };

  const [createCategory, isCreatingCategory] = useFetching(async (title: string) => {
    return await CategoryService.create(title);
  });

  const handleCreateCategory = async (data: CategoryFormData) => {
    const response = await createCategory(data.title);
    
    if (response && response.messageType !== 'error') {
      await fetchCategories();
      const newId = response.data as unknown as string;
      if (newId && typeof newId === 'string') {
        setSelectedCategories(prev => [...prev, newId]);
      }
      setIsCategoryModalOpen(false);
    }
  };

  const handleAddCharacteristic = () => {
    if (!selectedCharId || !charValue.trim()) return;
    const characteristic = availableCharacteristics.find(c => c.id === selectedCharId);
    if (!characteristic) return;

    setProductCharacteristics(prev => {
      const newChars = [...prev, {
        characteristicId: characteristic.id,
        name: characteristic.name,
        value: charValue.trim()
      }];
      return newChars.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    setSelectedCharId('');
    setCharValue('');
    setIsCharPopoverOpen(false);
  };

  const handleRemoveCharacteristic = (id: string) => {
    setProductCharacteristics(prev => prev.filter(c => c.characteristicId !== id));
  };

  // Only show active characteristics that haven't been added yet
  const unselectedCharacteristics = availableCharacteristics.filter(
    ac => !productCharacteristics.some(pc => pc.characteristicId === ac.id)
  );

  return (
    <div className="product-form-container">
      <form id="product-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="product-form-grid">
          {/* Left Column - Main Form Fields */}
          <div className="product-form-main">
            <Input 
              label="Назва товару" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Введіть назву"
            />
            
            <div className="input-group">
              <label className="input-label">Опис товару</label>
              <textarea 
                className="input-field" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={4} 
                placeholder="Введіть детальний опис"
              />
            </div>

            <div className="price-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input 
                label="Ціна (Грн)" 
                type="number" 
                min="0"
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                required 
              />
              <Input 
                label="Копійки" 
                type="number" 
                min="0"
                max="99"
                value={priceCoin} 
                onChange={e => setPriceCoin(e.target.value)} 
                required 
              />
            </div>

            <div className="price-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>В наявності</span>
              </label>
              
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Активний</span>
              </label>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">Бренд</label>
              <select
                className="input-field"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">-- Оберіть бренд (необов'язково) --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Категорії</label>
                <button 
                  type="button" 
                  onClick={() => setIsCategoryModalOpen(true)}
                  style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                  title="Створити нову категорію"
                >
                  +
                </button>
              </div>
              <MultiSelect
                options={categories}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Виберіть категорії..."
              />
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">Зображення</label>
              <ImageUploader 
                images={images} 
                onImagesChange={handleImagesChange} 
                onRemoveImage={handleRemoveImage} 
              />
            </div>
          </div>

          {/* Right Column - Characteristics Panel */}
          <div className="product-form-sidebar">
            <div className="product-form-sidebar-header">
              <h3>Характеристики</h3>
              <div className="char-popover-container">
                <button 
                  type="button" 
                  className="circle-add-btn"
                  title="Додати нову характеристику"
                  onClick={() => setIsCharPopoverOpen(!isCharPopoverOpen)}
                >
                  +
                </button>
                
                {isCharPopoverOpen && (
                  <div className="char-popover">
                    <div className="char-popover-header">
                      <h4>Нова характеристика</h4>
                      <button type="button" className="close-popover-btn" onClick={() => setIsCharPopoverOpen(false)}>&times;</button>
                    </div>
                    
                    <div className="char-add-form">
                      <div>
                        <label className="char-add-label">Оберіть (Знайдено: {availableCharacteristics.length})</label>
                        <select 
                          className="char-add-select" 
                          value={selectedCharId} 
                          onChange={e => setSelectedCharId(e.target.value)}
                        >
                          <option value="">-- Виберіть... --</option>
                          {unselectedCharacteristics.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="char-add-label">Значення</label>
                        <input 
                          type="text" 
                          className="char-add-input" 
                          value={charValue} 
                          onChange={e => setCharValue(e.target.value)} 
                          placeholder="Введіть значення"
                        />
                      </div>
                      <Button type="button" onClick={handleAddCharacteristic} disabled={!selectedCharId || !charValue.trim()}>
                        Зберегти
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {productCharacteristics.length > 0 ? (
              <div className="characteristics-table-container">
                <table className="characteristics-table">
                  <thead>
                    <tr>
                      <th>Характеристика</th>
                      <th>Значення</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productCharacteristics.map((pc) => (
                      <tr key={pc.characteristicId}>
                        <td>{pc.name}</td>
                        <td>{pc.value}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" onClick={() => handleRemoveCharacteristic(pc.characteristicId)} className="remove-char-btn" title="Видалити">&times;</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="characteristics-empty">
                Характеристики ще не додані
              </div>
            )}
          </div>
        </div>

        <button type="submit" id="product-form" style={{ display: 'none' }}></button>
      </form>

      <FormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Створити категорію"
        buttons={[
          {
            label: "Створити",
            type: "submit",
            formId: "category-form",
            isLoading: isCreatingCategory
          }
        ]}
      >
        <CategoryForm onSubmit={handleCreateCategory} />
      </FormModal>
    </div>
  );
};

export default ProductForm;
