import React, { useState, useEffect } from 'react';
import BrandService from '../../../services/BrandService';
import type { BrandDto } from '../../../types/brand';
import BrandModal from '../../../components/Admin/BrandModal';
import ConfirmModal from '../../../components/UI/Modal/ConfirmModal';
import { useFetching } from '../../../hooks/useFetching';
import { Table } from '../../../components/UI/Table/Table';
import type { Column } from '../../../components/UI/Table/Table';
import '../../../styles/pages/Admin/AdminTables.css';

const BrandsAdmin: React.FC = () => {
    const [brands, setBrands] = useState<BrandDto[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<BrandDto | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<{id: string, name: string} | null>(null);

    const [fetchBrands, isLoading] = useFetching(async () => {
        return await BrandService.getAll(true);
    });

    const loadBrands = async () => {
        const response = await fetchBrands();
        if (response && response.messageType !== 'error' && response.data?.brands) {
            setBrands(response.data.brands);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const handleOpenModal = (brand?: BrandDto) => {
        setEditingBrand(brand || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
    };

    const [handleSave, isSaving] = useFetching(async (data: { name: string; enabled: boolean }) => {
        if (editingBrand) {
            return await BrandService.update(editingBrand.id, { id: editingBrand.id, ...data });
        } else {
            return await BrandService.create(data);
        }
    });

    const onSaveWrapper = async (data: { name: string; enabled: boolean }) => {
        const response = await handleSave(data);
        if (response && response.messageType !== 'error') {
            await loadBrands();
            return response;
        }
        return response;
    };

    const confirmDelete = (id: string, name: string) => {
        setBrandToDelete({ id, name });
        setIsConfirmOpen(true);
    };

    const [executeDeleteAction, isDeleting] = useFetching(async () => {
        if (!brandToDelete) return;
        return await BrandService.delete(brandToDelete.id);
    });

    const executeDelete = async () => {
        const response = await executeDeleteAction();
        if (response && response.messageType !== 'error') {
            setIsConfirmOpen(false);
            setBrandToDelete(null);
            await loadBrands();
        }
    };

    const columns: Column<BrandDto>[] = [
        { key: 'name', title: 'Назва' },
        { 
            key: 'enabled', 
            title: 'Статус', 
            render: (item) => (
                <span className={`status-badge ${item.enabled ? 'status-active' : 'status-inactive'}`}>
                    {item.enabled ? 'Активна' : 'Вимкнена'}
                </span>
            ) 
        },
        { 
            key: 'actions', 
            title: 'Дії', 
            render: (item) => (
                <div className="admin-table-actions">
                    <button 
                        className="action-btn" 
                        title="Редагувати"
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                    >
                        ✏️
                    </button>
                    <button 
                        className="action-btn delete" 
                        title="Видалити"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(item.id, item.name); }}
                    >
                        🗑️
                    </button>
                </div>
            ) 
        }
    ];

    return (
        <div className="admin-table-container">
            <div className="admin-header-actions" style={{ marginBottom: '1rem' }}>
                <h1>Управління брендами</h1>
            </div>

            <Table 
                columns={columns}
                data={brands}
                totalCount={brands.length}
                page={1}
                pageSize={Math.max(brands.length, 10)}
                isLoading={isLoading}
                onPageChange={() => {}}
                onSortChange={() => {}}
                onFilterChange={() => {}}
                onAdd={() => handleOpenModal()}
                addText="Додати бренд"
            />

            <BrandModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveWrapper}
                brand={editingBrand}
            />

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Видалення бренду"
                message={`Ви впевнені, що хочете видалити бренд "${brandToDelete?.name}"?`}
                onConfirm={executeDelete}
                confirmText="Видалити"
                cancelText="Скасувати"
                isDestructive={true}
            />
        </div>
    );
};

export default BrandsAdmin;
