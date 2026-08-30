import React, { useState, useEffect } from 'react';
import CharacteristicService from '../../../services/CharacteristicService';
import type { CharacteristicDto } from '../../../types/characteristic';
import CharacteristicModal from '../../../components/Admin/CharacteristicModal';
import ConfirmModal from '../../../components/UI/Modal/ConfirmModal';
import { useFetching } from '../../../hooks/useFetching';
import { Table } from '../../../components/UI/Table/Table';
import type { Column } from '../../../components/UI/Table/Table';
import '../../../styles/pages/Admin/AdminTables.css';

const CharacteristicsAdmin: React.FC = () => {
    const [characteristics, setCharacteristics] = useState<CharacteristicDto[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCharacteristic, setEditingCharacteristic] = useState<CharacteristicDto | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [characteristicToDelete, setCharacteristicToDelete] = useState<{id: string, name: string} | null>(null);

    const [fetchCharacteristics, isLoading] = useFetching(async () => {
        return await CharacteristicService.getAll(true);
    });

    const loadCharacteristics = async () => {
        const response = await fetchCharacteristics();
        if (response && response.messageType !== 'error' && response.data?.data?.characteristics) {
            setCharacteristics(response.data.data.characteristics);
        }
    };

    useEffect(() => {
        loadCharacteristics();
    }, []);

    const handleOpenModal = (characteristic?: CharacteristicDto) => {
        setEditingCharacteristic(characteristic || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCharacteristic(null);
    };

    const [handleSave, isSaving] = useFetching(async (data: { name: string; enabled: boolean }) => {
        if (editingCharacteristic) {
            return await CharacteristicService.update(editingCharacteristic.id, { id: editingCharacteristic.id, ...data });
        } else {
            return await CharacteristicService.create(data);
        }
    });

    const onSaveWrapper = async (data: { name: string; enabled: boolean }) => {
        const response = await handleSave(data);
        if (response && response.messageType !== 'error') {
            await loadCharacteristics();
            return response;
        }
        return response;
    };

    const confirmDelete = (id: string, name: string) => {
        setCharacteristicToDelete({ id, name });
        setIsConfirmOpen(true);
    };

    const [executeDeleteAction, isDeleting] = useFetching(async () => {
        if (!characteristicToDelete) return;
        return await CharacteristicService.delete(characteristicToDelete.id);
    });

    const executeDelete = async () => {
        const response = await executeDeleteAction();
        if (response && response.messageType !== 'error') {
            setIsConfirmOpen(false);
            setCharacteristicToDelete(null);
            await loadCharacteristics();
        }
    };

    const columns: Column<CharacteristicDto>[] = [
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
                <h1>Управління характеристиками</h1>
            </div>

            <Table 
                columns={columns}
                data={characteristics}
                totalCount={characteristics.length}
                page={1}
                pageSize={Math.max(characteristics.length, 10)}
                isLoading={isLoading}
                onPageChange={() => {}}
                onSortChange={() => {}}
                onFilterChange={() => {}}
                onAdd={() => handleOpenModal()}
                addText="Додати характеристику"
            />

            <CharacteristicModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveWrapper}
                characteristic={editingCharacteristic}
            />

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Видалення характеристики"
                message={`Ви впевнені, що хочете видалити характеристику "${characteristicToDelete?.name}"?`}
                onConfirm={executeDelete}
                confirmText="Видалити"
                cancelText="Скасувати"
                isDestructive={true}
            />
        </div>
    );
};

export default CharacteristicsAdmin;
