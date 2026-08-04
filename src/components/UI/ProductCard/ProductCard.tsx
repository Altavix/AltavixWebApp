import React, { useState } from 'react';
import type { ProductVm } from '../../../types/product';
import '../../../styles/components/UI/ProductCard.css';

interface ProductCardProps {
  product: ProductVm;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ensureBase64Prefix = (base64Str: string) => {
  if (base64Str.startsWith('http') || base64Str.startsWith('data:image')) {
    return base64Str;
  }
  return `data:image/jpeg;base64,${base64Str}`;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false, onDelete, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images.map(ensureBase64Prefix)
    : ['https://via.placeholder.com/300x400?text=No+Image'];

  const priceDisplay = `${product.price}.${product.priceCoin.toString().padStart(2, '0')} ₴`;

  const handleDelete = () => {
    if (onDelete) onDelete(product.id);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(product.id);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={images[currentImageIndex]} alt={product.title} className="product-image" />
        
        {images.length > 1 && (
          <div className="carousel-controls">
            <button className="carousel-btn prev-btn" onClick={handlePrevImage}>
              &#10094;
            </button>
            <button className="carousel-btn next-btn" onClick={handleNextImage}>
              &#10095;
            </button>
            <div className="carousel-dots">
              {images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

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
