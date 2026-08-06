import React, { useState } from 'react';
import Input from '../UI/Input';
import '../../styles/components/Admin/ProductForm.css'; // We can reuse the form container styles

export interface CategoryFormData {
  title: string;
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  isSubmitting?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    onSubmit({ title });
  };

  return (
    <div className="product-form-container" style={{ minHeight: 'auto', padding: '10px 0' }}>
      <form id="category-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Input 
          label="Назва категорії" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="Введіть назву категорії"
        />
        
        <button type="submit" id="category-form-submit" style={{ display: 'none' }}></button>
      </form>
    </div>
  );
};

export default CategoryForm;
