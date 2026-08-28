import React, { useState, useEffect } from 'react';
import type { CharacteristicDto } from '../../types/characteristic';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface CharacteristicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; enabled: boolean }) => Promise<any>;
    characteristic?: CharacteristicDto | null;
}

const CharacteristicModal: React.FC<CharacteristicModalProps> = ({ isOpen, onClose, onSave, characteristic }) => {
    const [name, setName] = useState('');
    const [enabled, setEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(characteristic?.name || '');
            setEnabled(characteristic?.enabled ?? true);
        }
    }, [isOpen, characteristic]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            const result = await onSave({ name: name.trim(), enabled });
            if (result && result.messageType !== 'error') {
                onClose();
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="admin-modal-content">
                <div className="admin-modal-header">
                    <h2>{characteristic ? 'Редагувати характеристику' : 'Створити характеристику'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="admin-modal-body">
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <Input
                            label="Назва характеристики"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введіть назву..."
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem' }}
                            />
                            Активна (Enabled)
                        </label>
                    </div>
                    
                    <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                            Скасувати
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSaving} disabled={!name.trim()}>
                            Зберегти
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CharacteristicModal;
