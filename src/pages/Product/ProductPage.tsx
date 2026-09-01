import { useCart } from '../../context/CartContext';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import type { ProductVm } from '../../types/product';
import type { CategoryDto } from '../../types/category';
import Loader from '../../components/UI/Loader';
import '../../styles/pages/ProductPage.css';

const ensureBase64Prefix = (base64Str: string) => {
  if (base64Str.startsWith('http') || base64Str.startsWith('data:image')) {
    return base64Str;
  }
  return `data:image/jpeg;base64,${base64Str}`;
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductVm | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'characteristics'>('description');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("No ID provided");
        
        const [productRes, categoryRes] = await Promise.all([
          ProductService.getByIdPublic(id),
          CategoryService.getAll()
        ]);

        if (productRes && productRes.data) {
          // If the backend wraps it in ApiResponseDto, use .data
          // Otherwise, the response itself is the product
          const productData = 'data' in productRes.data ? productRes.data.data : productRes.data;
          
          if (productData) {
            setProduct(productData as ProductVm);
          } else {
            setError("Product not found");
          }
        } else {
          setError("Product not found");
        }

        if (categoryRes?.data?.categories) {
          setCategories(categoryRes.data.categories);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (isLoading) {
    return (
      <div className="product-page-loader">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page-error">
        <h2>Oops! Something went wrong.</h2>
        <p>{error || "Product not found"}</p>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map(ensureBase64Prefix)
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  const priceDisplay = `${product.price}.${product.priceCoin.toString().padStart(2, '0')} ₴`;

  // Map category IDs to their real titles
  const productCategories = product.categoryIds
    .map(cId => categories.find(c => c.id === cId))
    .filter((c): c is CategoryDto => c !== undefined);

  return (
    <div className="product-page-container">
      <div className="product-page-content">
        
        {/* Left Column: Image Gallery and Basic Info */}
        <div className="product-left-column">
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img 
                src={images[currentImageIndex]} 
                alt={product.title} 
                className="main-image"
              />
              {images.length > 1 && (
                <>
                  <button 
                    className="gallery-nav-btn prev" 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  >
                    &#10094;
                  </button>
                  <button 
                    className="gallery-nav-btn next" 
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  >
                    &#10095;
                  </button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-wrapper ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="thumbnail-image" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-under-image">
            <div className="product-categories">
              {productCategories.map(cat => (
                <span key={cat.id} className="category-badge">
                  {cat.title}
                </span>
              ))}
            </div>

            {product.brandName && (
              <div className="product-brand-large">{product.brandName}</div>
            )}

            <h1 className="product-title-large">{product.title}</h1>
            <div className="product-price-large">{priceDisplay}</div>

            <div className="product-actions-large">
              {!product.enabled ? (
                <div className="unavailable-message" style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 600, padding: '1rem', border: '1px solid #ef4444', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fef2f2' }}>
                  Цей товар знято з продажу
                </div>
              ) : !product.inStock ? (
                <div className="unavailable-message" style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 600, padding: '1rem', border: '1px solid #94a3b8', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f1f5f9' }}>
                  Немає в наявності
                </div>
              ) : (
                <>
                  <button className="btn-add-to-cart" onClick={() => addToCart(product.id, 1)}>
                    Додати в кошик
                  </button>
                  {/* <button className="btn-buy-now">
                    Купити в один клік
                  </button> */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabs (Description / Characteristics) */}
        <div className="product-right-column">
          <div className="product-tabs">
            <button 
              className={`product-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Опис
            </button>
            <button 
              className={`product-tab-btn ${activeTab === 'characteristics' ? 'active' : ''}`}
              onClick={() => setActiveTab('characteristics')}
            >
              Характеристики
            </button>
          </div>

          <div className="product-tab-content">
            {activeTab === 'description' && (
              <div className="product-description-container">
                <p className="product-description-text">{product.description}</p>
              </div>
            )}
            
            {activeTab === 'characteristics' && (
              <div className="product-characteristics-container">
                {product.characteristics && product.characteristics.length > 0 ? (
                  <>
                    <table className="characteristics-table-public">
                      <tbody>
                        {(isExpanded ? product.characteristics : product.characteristics.slice(0, 8)).map((char, index) => (
                          <tr key={index}>
                            <td className="char-name">{char.name}</td>
                            <td className="char-value">{char.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {product.characteristics.length > 8 && (
                      <button 
                        className="btn-show-more" 
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? 'Менше' : 'Ще'}
                      </button>
                    )}
                  </>
                ) : (
                  <p>Характеристики відсутні</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;

