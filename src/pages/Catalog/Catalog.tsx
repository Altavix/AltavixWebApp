import React, { useEffect, useState, useContext } from 'react';
import ProductService from '../../services/ProductService';
import { ProductVm, PaginatedList } from '../../types/product';
import { useFetching } from '../../hooks/useFetching';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from '../../components/UI/ProductCard/ProductCard';
import Pagination from '../../components/UI/Pagination/Pagination';
import Loader from '../../components/UI/Loader';
import '../../styles/pages/Catalog.css';

const Catalog: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;
  const auth = useContext(AuthContext);
  const isAdmin = auth?.isAuth && auth?.user?.role === 'Admin';
  
  const [productsData, setProductsData] = useState<PaginatedList<ProductVm> | null>(null);

  const [fetchProducts, isLoading] = useFetching(async (p: number, size: number) => {
    return isAdmin 
      ? await ProductService.getAllAdmin(p, size)
      : await ProductService.getAllPublic(p, size);
  });

  const loadProducts = async () => {
    const response = await fetchProducts(page, pageSize);
    if (response && response.messageType !== 'error' && response.data) {
      setProductsData(response.data as PaginatedList<ProductVm>);
    }
  };

  useEffect(() => {
    loadProducts();
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, isAdmin]);

  const handleDelete = async (id: string) => {
    const response = await ProductService.deleteProduct(id);
    if (response && response.data?.messageType !== 'error') {
      loadProducts();
    }
  };

  const handleCreateProduct = () => {
    alert('Створення нового товару в розробці!');
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1 className="catalog-title">Discover Our Collection</h1>
        <p className="catalog-subtitle">Explore the finest products tailored just for you.</p>
        
        {isAdmin && (
          <div className="admin-catalog-actions" style={{ marginTop: '2rem' }}>
            <button 
              onClick={handleCreateProduct}
              style={{
                background: '#fff', 
                color: 'var(--color-primary-dark)', 
                padding: '12px 24px', 
                borderRadius: '8px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              + Create New Product
            </button>
          </div>
        )}
      </div>
      
      <div className="container">
        {isLoading ? (
          <div className="catalog-loader">
            <Loader />
          </div>
        ) : (
          <>
            {productsData?.items && productsData.items.length > 0 ? (
              <>
                <div className="product-grid">
                  {productsData.items.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isAdmin={isAdmin}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                <Pagination 
                  currentPage={productsData.pageNumber}
                  totalPages={productsData.totalPages}
                  onPageChange={(p) => setPage(p)}
                  hasNextPage={productsData.hasNextPage}
                  hasPreviousPage={productsData.hasPreviousPage}
                />
              </>
            ) : (
              <div className="catalog-empty">
                <h3>No products found</h3>
                <p>Check back later for new arrivals!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;
