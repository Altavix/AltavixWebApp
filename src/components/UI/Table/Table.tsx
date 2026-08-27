import React, { useState } from 'react';
import Loader from '../Loader';
import MultiSelect from '../Select/MultiSelect';
import Input from '../Input';
import Button from '../Button';
import type { KeyValue } from '../../../types/common';
import '../../../styles/components/UI/Table.css';

export interface Column<T> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'dateRange' | 'numberRange';
    filterOptions?: KeyValue[];
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
    onAdd?: () => void;
    addText?: string;
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
    onRowClick,
    onAdd,
    addText = 'Додати'
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
            <div className="table-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <form className="table-filters" onSubmit={handleFilterSubmit} style={{ flex: 1 }}>
                    {columns.filter(c => c.filterable).map(col => {
                        const type = col.filterType || (col.filterOptions ? 'select' : 'text');
                        
                        if (type === 'numberRange' || type === 'dateRange') {
                            const inputType = type === 'numberRange' ? 'number' : 'date';
                            return (
                                <React.Fragment key={String(col.key)}>
                                    <div className="filter-group">
                                        <Input 
                                            type={inputType} 
                                            label={`${col.title} (від)`}
                                            value={localFilters[`Min${String(col.key)}`] || ''}
                                            onChange={e => setLocalFilters(prev => ({ ...prev, [`Min${String(col.key)}`]: e.target.value }))}
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <Input 
                                            type={inputType} 
                                            label={`${col.title} (до)`}
                                            value={localFilters[`Max${String(col.key)}`] || ''}
                                            onChange={e => setLocalFilters(prev => ({ ...prev, [`Max${String(col.key)}`]: e.target.value }))}
                                        />
                                    </div>
                                </React.Fragment>
                            );
                        }

                        return (
                            <div key={String(col.key)} className="filter-group">
                                {type === 'select' && (
                                    <MultiSelect 
                                        options={col.filterOptions || []}
                                        selectedValues={localFilters[String(col.key)] ? localFilters[String(col.key)].split(',') : []}
                                        onChange={(selected) => setLocalFilters(prev => ({ ...prev, [String(col.key)]: selected.join(',') }))}
                                        label={col.title}
                                    />
                                )}
                                {type === 'text' && (
                                    <Input 
                                        type="text"
                                        label={col.title}
                                        value={localFilters[String(col.key)] || ''}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, [String(col.key)]: e.target.value }))}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {columns.some(c => c.filterable) && (
                        <div className="filter-buttons">
                            <Button type="submit" variant="primary" disabled={isLoading} className="btn-sm">Застосувати</Button>
                            <Button type="button" variant="secondary" onClick={handleFilterReset} disabled={isLoading} className="btn-sm">Скинути</Button>
                        </div>
                    )}
                </form>
                {onAdd && (
                    <div className="table-add-action" style={{ marginLeft: '1rem' }}>
                        <Button variant="primary" onClick={onAdd} className="btn-sm">
                            <span style={{ marginRight: '0.5rem' }}>+</span> {addText}
                        </Button>
                    </div>
                )}
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
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Loader />
                                </td>
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
                    <Button 
                        variant="secondary"
                        disabled={page === 1 || isLoading} 
                        onClick={() => onPageChange(page - 1)}
                        className="btn-sm"
                    >
                        Попередня
                    </Button>
                    <span>Сторінка {page} з {totalPages}</span>
                    <Button 
                        variant="secondary"
                        disabled={page === totalPages || isLoading} 
                        onClick={() => onPageChange(page + 1)}
                        className="btn-sm"
                    >
                        Наступна
                    </Button>
                </div>
            )}
        </div>
    );
}
