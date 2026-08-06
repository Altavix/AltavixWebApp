import React, { useEffect, useState, useContext } from 'react';
import ProductService from '../../services/ProductService';
import type { ProductVm, PaginatedList } from '../../types/product';
import { useFetching } from '../../hooks/useFetching';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from '../../components/UI/ProductCard/ProductCard';
import Pagination from '../../components/UI/Pagination/Pagination';
import Loader from '../../components/UI/Loader';
import ConfirmModal from '../../components/UI/Modal/ConfirmModal';
import FormModal from '../../components/UI/Modal/FormModal';
import ProductForm from '../../components/Admin/ProductForm';
import type { ProductFormData } from '../../components/Admin/ProductForm';
import '../../styles/pages/Catalog.css';

const Catalog: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;
  const auth = useContext(AuthContext);
  const isAdmin = auth?.isAuth && auth?.user?.role === 'Admin';
  
  const [productsData, setProductsData] = useState<PaginatedList<ProductVm> | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductVm | null>(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, isAdmin]);

  const handleDeleteRequest = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const response = await ProductService.deleteProduct(productToDelete);
      if (response && response.data?.messageType !== 'error') {
        loadProducts();
      }
    }
  };

  const handleEditRequest = async (id: string) => {
    const product = productsData?.items.find(p => p.id === id);
    if (product) {
      setProductToEdit(product);
      setIsFormOpen(true);
    }
  };

  const handleCreateProduct = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const [submitForm, isSubmitting] = useFetching(async (data: ProductFormData) => {
    if (productToEdit) {
      const updateData = { id: productToEdit.id, ...data };
      await ProductService.updateProduct(updateData);
    } else {
      await ProductService.createProduct(data);
    }
  });

  const handleFormSubmit = async (data: ProductFormData) => {
    const response = await submitForm(data);
    if (response && response.messageType !== 'error') {
      setIsFormOpen(false);
      loadProducts(); // Refresh list
    }
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
                      onDelete={handleDeleteRequest}
                      onEdit={handleEditRequest}
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

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        title="Підтвердити видалення"
        message="Ви впевнені, що хочете видалити цей товар? Цю дію неможливо скасувати."
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />

      {isFormOpen && (
        <FormModal 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={productToEdit ? 'Редагувати товар' : 'Створити новий товар'}
          buttons={[
            {
              label: 'Скасувати',
              onClick: () => setIsFormOpen(false),
              variant: 'secondary'
            },
            {
              label: 'Зберегти',
              type: 'submit',
              formId: 'product-form',
              variant: 'primary',
              isLoading: isSubmitting
            }
          ]}
        >
          <ProductForm 
            initialData={productToEdit} 
            onSubmit={handleFormSubmit} 
          />
        </FormModal>
      )}
    </div>
  );
};

export default Catalog;
