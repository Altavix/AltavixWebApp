import React, { useEffect, useState, useContext, useRef } from 'react';
import ProductService from '../../services/ProductService';
import type { ProductFilters } from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import BrandService from '../../services/BrandService';
import type { ProductVm, PaginatedList } from '../../types/product';
import type { CategoryDto } from '../../types/category';
import type { BrandDto } from '../../types/brand';
import { useFetching } from '../../hooks/useFetching';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from '../../components/UI/ProductCard/ProductCard';
import Pagination from '../../components/UI/Pagination/Pagination';
import Loader from '../../components/UI/Loader';
import ConfirmModal from '../../components/UI/Modal/ConfirmModal';
import FormModal from '../../components/UI/Modal/FormModal';
import ProductForm from '../../components/Admin/ProductForm';
import Input from '../../components/UI/Input';
import type { ProductFormData } from '../../components/Admin/ProductForm';
import SidebarFilter from '../../components/UI/SidebarFilter/SidebarFilter';
import '../../styles/pages/Catalog.css';

const sortOptions = [
  { value: 'price_asc', label: 'Від дешевших до дорожчих' },
  { value: 'price_desc', label: 'Від дорожчих до дешевших' },
  { value: 'newest', label: 'Від найновіших' },
  { value: 'oldest', label: 'Від найстаріших' },
];

const Catalog: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 100;
  const auth = useContext(AuthContext);
  const isAdmin = auth?.isAuth && auth?.user?.role === 'Admin';
  
  const [productsData, setProductsData] = useState<PaginatedList<ProductVm> | null>(null);
  
  // Filter options
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [characteristics, setCharacteristics] = useState<import('../../types/characteristic').CharacteristicFilterDto[]>([]);
  const [dbMaxPrice, setDbMaxPrice] = useState<number>(100000);
  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({
    page: page,
    pageSize: pageSize,
    brandIds: [],
    categoryIds: [],
    characteristics: {},
    minPrice: 0,
    maxPrice: 100000,
    searchTerm: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortMenuOpen]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductVm | null>(null);

  const [fetchFiltersData] = useFetching(async () => {
    const [catRes, brandRes, priceRes, charRes] = await Promise.all([
      CategoryService.getAll(),
      BrandService.getAll(),
      ProductService.getMaxPrice(),
      import('../../services/CharacteristicService').then(m => m.default.getFilters())
    ]);
    if (catRes?.data?.categories) setCategories(catRes.data.categories as any);
    if (brandRes?.data?.data?.brands) setBrands(brandRes.data.data.brands as any);
    if (charRes?.data?.data) setCharacteristics(charRes.data.data);
    if (priceRes?.data?.data) {
        setDbMaxPrice(priceRes.data.data as number);
        setCurrentFilters(prev => ({...prev, maxPrice: priceRes.data.data as number}));
    }
    setIsFiltersLoaded(true);
  });

  const [fetchProducts, isLoading] = useFetching(async (p: number, size: number, filters: ProductFilters) => {
    return isAdmin 
      ? await ProductService.getAllAdmin({ ...filters, page: p, pageSize: size })
      : await ProductService.getAllPublic({ ...filters, page: p, pageSize: size });
  });

  const loadProducts = async () => {
    const response = await fetchProducts(page, pageSize, currentFilters);
    if (response && response.messageType !== 'error' && response.data) {
      setProductsData(response.data as PaginatedList<ProductVm>);
    }
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    if (!isFiltersLoaded) return;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, isAdmin, currentFilters, isFiltersLoaded]);


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
      return await ProductService.updateProduct(updateData);
    } else {
      return await ProductService.createProduct(data);
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
      <div className="container catalog-layout">
        {/* SIDEBAR */}
        <aside className={`catalog-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="mobile-filter-header">
            <h3>Фільтри</h3>
            <button className="close-filter-btn" onClick={() => setIsMobileFilterOpen(false)}>&times;</button>
          </div>
          <SidebarFilter 
            categories={categories}
            brands={brands}
            characteristics={characteristics}
            maxPrice={dbMaxPrice}
            onFilterChange={(f) => {
              setCurrentFilters(prev => ({...prev, ...f}));
              setPage(1);
            }}
            onClose={() => setIsMobileFilterOpen(false)}
          />
        </aside>
        
        {/* MAIN CONTENT */}
        <div className="catalog-main">
            <div className="catalog-main-header">
                <div className="catalog-title-group">
                  <h2>Каталог товарів</h2>
                  <div className="catalog-header-actions">
                    <button className="icon-btn mobile-filter-btn" onClick={() => setIsMobileFilterOpen(true)}>
                      <img src="/icons/filters.svg" alt="Фільтри" />
                    </button>
                    <div className="sort-menu-container" ref={sortMenuRef} style={{ position: 'relative' }}>
                      <button className="icon-btn sort-btn" onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}>
                        <img src="/icons/sort.svg" alt="Сортування" />
                      </button>
                      {isSortMenuOpen && (
                        <div className="sort-dropdown">
                          {sortOptions.map(option => (
                            <button
                              key={option.value}
                              className={`sort-option ${currentFilters.sortBy === option.value ? 'active' : ''}`}
                              onClick={() => {
                                setCurrentFilters(prev => ({...prev, sortBy: option.value}));
                                setPage(1);
                                setIsSortMenuOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                <button 
                    className="btn-create-product-icon"
                    onClick={handleCreateProduct}
                    title="Створити новий товар"
                >
                    +
                </button>
                )}
            </div>

            <div className="catalog-search-bar" style={{ marginBottom: '1.5rem', '--input-bg': 'var(--color-bg-light)' } as any}>
              <Input 
                label="Пошук" 
                value={currentFilters.searchTerm || ''}
                onChange={(e: any) => {
                  setCurrentFilters(prev => ({...prev, searchTerm: e.target.value}));
                  setPage(1);
                }}
              />
            </div>

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
                    <h3>Товарів не знайдено</h3>
                    <p>Спробуйте змінити фільтри</p>
                </div>
                )}
            </>
            )}
        </div>
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
          title={productToEdit ? "Редагувати товар" : "Створити новий товар"}
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
