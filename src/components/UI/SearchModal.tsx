import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { $api } from '../../config/api';
import { useFetching } from '../../hooks/useFetching';
import '../../styles/components/UI/SearchModal.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiMethod: string;
    onSelect: (item: any) => void;
    title?: string;
    mainField: string | ((item: any) => string);
    subField1?: string | ((item: any) => string);
    subField2?: string | ((item: any) => string);
}

const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    apiMethod,
    onSelect,
    title = 'Пошук',
    mainField,
    subField1,
    subField2
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const [fetchData, isLoading] = useFetching(async (term: string) => {
        return $api.get(`${apiMethod}?term=${encodeURIComponent(term)}`);
    });

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                const res = await fetchData(searchTerm);
                const data = res.data as any;
                if (data && data.users) {
                    setResults(data.users);
                } else if (Array.isArray(data)) {
                    setResults(data);
                } else if (data && data.items) {
                    setResults(data.items);
                } else {
                    setResults([]);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    if (!isOpen) return null;

    const getValue = (item: any, field: string | ((item: any) => string) | undefined) => {
        if (!field) return null;
        if (typeof field === 'function') return field(item);
        return item[field];
    };

    return createPortal(
        <div className="search-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="search-modal-content">
                <div className="search-modal-header">
                    <h3>{title}</h3>
                    <button className="search-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="search-modal-body">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Введіть для пошуку..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    
                    <div className="search-results">
                        {isLoading && <div className="search-loading">Пошук...</div>}
                        {!isLoading && results.length === 0 && searchTerm.trim().length >= 2 && (
                            <div className="search-no-results">Нічого не знайдено</div>
                        )}
                        {!isLoading && results.map((item, idx) => (
                            <div 
                                key={item.id || idx} 
                                className="search-result-item"
                                onClick={() => { onSelect(item); onClose(); }}
                            >
                                <div className="search-item-main">{getValue(item, mainField)}</div>
                                {subField1 && <div className="search-item-sub">{getValue(item, subField1)}</div>}
                                {subField2 && <div className="search-item-sub">{getValue(item, subField2)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SearchModal;
