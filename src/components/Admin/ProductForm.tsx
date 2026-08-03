import React, { useState, useEffect } from 'react';
import { ProductVm } from '../../types/product';
import { CategoryDto } from '../../types/category';
import CategoryService from '../../services/CategoryService';
import Input from '../UI/Input';
import '../../styles/components/Admin/ProductForm.css';

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  priceCoin: number;
  categoryIds: string[];
  imagesBase64: string[];
}

interface ProductFormProps {
  initialData?: ProductVm | null;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isSubmitting = false }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceCoin, setPriceCoin] = useState(initialData?.priceCoin?.toString() || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  
  // existing images from API if editing
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  
  // newly uploaded images
  const [newImagesBase64, setNewImagesBase64] = useState<string[]>([]);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewImagesBase64(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input so same file can be selected again if needed
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Called by FormModal through form submission
  const handleSubmit = () => {
    // Combine existing images and new images for submission
    // Note: the backend logic for update usually replaces all images or merges them.
    // Assuming backend replaces all images if we send a new list.
    const allImages = [...existingImages, ...newImagesBase64];
    
    onSubmit({
      title,
      description,
      price: parseInt(price) || 0,
      priceCoin: parseInt(priceCoin) || 0,
      categoryIds: selectedCategories,
      imagesBase64: allImages
    });
  };

  return (
    <div className="product-form-container">
      {/* We need to hook this to the parent form submission, 
          since we are inside FormModal's form, the parent captures onSubmit.
          We can just use a hidden submit button or let FormModal handle the click and trigger this.
          Wait, FormModal wraps children in <form onSubmit={...}> 
          But FormModal doesn't know about our state.
          Instead of rendering form here, ProductForm should render the fields,
          and use an imperative handle or we lift state up.
          Actually, we can use a simpler approach: FormModal doesn't wrap in <form>, 
          or we pass an ID to FormModal's button.
          Let's change FormModal to accept an id="product-form" and render the form tag here. 
      */}
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
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            className="file-input"
          />
          
          <div className="image-preview-container">
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} className="image-preview">
                <img src={img} alt="Preview" />
                <button type="button" onClick={() => removeExistingImage(index)}>×</button>
              </div>
            ))}
            {newImagesBase64.map((img, index) => (
              <div key={`new-${index}`} className="image-preview">
                <img src={img} alt="Preview" />
                <button type="button" onClick={() => removeNewImage(index)}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden submit button triggered by FormModal */}
        <button type="submit" id="product-form-submit" style={{ display: 'none' }}></button>
      </form>
    </div>
  );
};

export default ProductForm;
