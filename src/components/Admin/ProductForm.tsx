import React, { useState, useEffect } from 'react';
import type { ProductVm } from '../../types/product';
import type { CategoryDto } from '../../types/category';
import CategoryService from '../../services/CategoryService';
import Input from '../UI/Input';
import ImageUploader from '../UI/ImageUploader/ImageUploader';
import '../../styles/components/Admin/ProductForm.css';

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  priceCoin: number;
  categoryIds: string[];
  images: string[];
}

interface ProductFormProps {
  initialData?: ProductVm | null;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
}

// Utility to ensure images have correct base64 prefix
const ensureBase64Prefix = (base64Str: string) => {
  if (base64Str.startsWith('http') || base64Str.startsWith('data:image')) {
    return base64Str;
  }
  return `data:image/jpeg;base64,${base64Str}`;
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isSubmitting = false }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceCoin, setPriceCoin] = useState(initialData?.priceCoin?.toString() || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  
  // Combine all images into one state for the new Uploader
  const [images, setImages] = useState<string[]>(
    (initialData?.images || []).map(ensureBase64Prefix)
  );
  
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAll();
        if (response?.data?.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedCategories(selected);
  };

  const handleImagesChange = (newImagesBase64: string[]) => {
    setImages(prev => [...prev, ...newImagesBase64]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Called by FormModal through form submission
  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      price: parseInt(price) || 0,
      priceCoin: parseInt(priceCoin) || 0,
      categoryIds: selectedCategories,
      images: images
    });
  };

  return (
    <div className="product-form-container">
      <form id="product-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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

        <div className="price-group">
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

        <div className="input-group">
          <label className="input-label">Категорії (затисніть Ctrl для вибору декількох)</label>
          <select 
            multiple 
            className="input-field multi-select" 
            value={selectedCategories} 
            onChange={handleCategoryChange}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Зображення</label>
          <ImageUploader 
            images={images} 
            onImagesChange={handleImagesChange} 
            onRemoveImage={handleRemoveImage} 
          />
        </div>

        {/* Hidden submit button triggered by FormModal */}
        <button type="submit" id="product-form-submit" style={{ display: 'none' }}></button>
      </form>
    </div>
  );
};

export default ProductForm;
