import React, { useState } from 'react';
import MultiSelect from '../Select/MultiSelect';
import './Table.css';

export interface Column<T> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: { value: string; label: string }[];
    render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, string>;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onSortChange: (column: string, direction: 'asc' | 'desc') => void;
    onFilterChange: (filters: Record<string, string>) => void;
    onRowClick?: (item: T) => void;
}

export function Table<T>({
    columns,
    data,
    totalCount,
    page,
    pageSize,
    sortColumn,
    sortDirection,
    filters = {},
    isLoading = false,
    onPageChange,
    onSortChange,
    onFilterChange,
    onRowClick
}: TableProps<T>) {
    const totalPages = Math.ceil(totalCount / pageSize);

    const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            onSortChange(columnKey, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(columnKey, 'asc');
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange(localFilters);
    };

    const handleFilterReset = () => {
        setLocalFilters({});
        onFilterChange({});
    };

    return (
        <div className="table-container">
            <div className="table-header-actions">
                <form className="table-filters" onSubmit={handleFilterSubmit}>
                    {columns.filter(c => c.filterable).map(col => (
                        <div key={String(col.key)} className="filter-group">
                            {col.filterOptions ? (
                                <MultiSelect 
                                    options={col.filterOptions}
                                    selectedValues={localFilters[String(col.key)] ? localFilters[String(col.key)].split(',') : []}
                                    onChange={(selected) => setLocalFilters(prev => ({ ...prev, [String(col.key)]: selected.join(',') }))}
                                    placeholder={`Фільтр: ${col.title}`}
                                />
                            ) : (
                                <input 
                                    type="text"
                                    placeholder={`Пошук: ${col.title}`}
                                    value={localFilters[String(col.key)] || ''}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, [String(col.key)]: e.target.value }))}
                                    className="form-control"
                                />
                            )}
                        </div>
                    ))}
                    {columns.some(c => c.filterable) && (
                        <div className="filter-buttons">
                            <button type="submit" className="btn-primary btn-sm" disabled={isLoading}>Застосувати</button>
                            <button type="button" className="btn-secondary btn-sm" onClick={handleFilterReset} disabled={isLoading}>Скинути</button>
                        </div>
                    )}
                </form>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th 
                                    key={String(col.key)} 
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                    className={col.sortable ? 'sortable' : ''}
                                >
                                    {col.title}
                                    {col.sortable && sortColumn === col.key && (
                                        <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>Завантаження...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>Дані відсутні</td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr 
                                    key={index} 
                                    onClick={() => onRowClick && onRowClick(item)}
                                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                                >
                                    {columns.map(col => (
                                        <td key={String(col.key)}>
                                            {col.render ? col.render(item) : (item as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="table-pagination">
                    <button 
                        disabled={page === 1 || isLoading} 
                        onClick={() => onPageChange(page - 1)}
                        className="btn-secondary btn-sm"
                    >
                        Попередня
                    </button>
                    <span>Сторінка {page} з {totalPages}</span>
                    <button 
                        disabled={page === totalPages || isLoading} 
                        onClick={() => onPageChange(page + 1)}
                        className="btn-secondary btn-sm"
                    >
                        Наступна
                    </button>
                </div>
            )}
        </div>
    );
}
