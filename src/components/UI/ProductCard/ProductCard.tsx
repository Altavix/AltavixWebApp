import React from 'react';
import { ProductVm } from '../../../types/product';
import '../../../styles/components/UI/ProductCard.css';

interface ProductCardProps {
  product: ProductVm;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false, onDelete }) => {
  // Use the first image or a placeholder
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/300x400?text=No+Image';

  const priceDisplay = `${product.price}.${product.priceCoin.toString().padStart(2, '0')} \u20B4`;

  const handleDelete = () => {
    if (onDelete && window.confirm('Ви впевнені, що хочете видалити цей товар?')) {
      onDelete(product.id);
    }
  };

  const handleEdit = () => {
    alert('Редагування в розробці!');
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={imageUrl} alt={product.title} className="product-image" />
        <div className="product-actions">
          <button className="btn-icon" title="Add to Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{priceDisplay}</span>
        </div>
        {isAdmin && (
          <div className="admin-actions">
            <button className="btn-edit" onClick={handleEdit}>Edit</button>
            <button className="btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
