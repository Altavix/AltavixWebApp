import React, { useState, useEffect } from 'react';
import type { ProductVm } from '../../types/product';
import type { CategoryDto } from '../../types/category';
import CategoryService from '../../services/CategoryService';
import Input from '../UI/Input';
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

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceCoin, setPriceCoin] = useState(initialData?.priceCoin?.toString() || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  
  // Combine all images into one state for the new Uploader
  const [images, setImages] = useState<string[]>(
    (initialData?.images || []).map(ensureBase64Prefix)
  );
  
  const [categories, setCategories] = useState<{key: string, value: string}[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  useEffect(() => {
    fetchCategories();
  }, []);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>
              Категорії
            </label>
            <button 
              type="button" 
              onClick={() => setIsCategoryModalOpen(true)}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1
              }}
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

        <div className="input-group">
          <label className="input-label">Зображення</label>
          <ImageUploader 
            images={images} 
            onImagesChange={handleImagesChange} 
            onRemoveImage={handleRemoveImage} 
          />
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
