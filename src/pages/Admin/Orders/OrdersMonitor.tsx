import React, { useEffect, useState } from 'react';
import { Table } from '../../../components/UI/Table/Table';
import type { Column } from '../../../components/UI/Table/Table';
import { useFetching } from '../../../hooks/useFetching';
import { OrderService } from '../../../services/CartService';
import { Link, useNavigate } from 'react-router-dom';
import './OrdersMonitor.css';

interface OrderSummary {
    id: string;
    number: number;
    created: string;
    ordered: boolean;
    paid: boolean;
    processing: boolean;
    shipped: boolean;
    delivered: boolean;
    cancelled: boolean;
    clientName: string;
    city: string;
    totalPrice: number;
    paymentMethodTitle: string;
    totalQuantity: number;
}

const OrdersMonitor: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    
    // Table state
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [sortColumn, setSortColumn] = useState<string>('Created');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState<Record<string, string>>({});

    const [paymentMethods, setPaymentMethods] = useState<{value: string, label: string}[]>([]);

    const [fetchOrders, isLoading] = useFetching(async () => {
        const response = await OrderService.getOrdersList(undefined, page, pageSize, sortColumn, sortDirection, filters);
        if (response.data) {
            setOrders(response.data.orders || []);
            setTotalCount(response.data.totalCount || 0);
        }
    });

    useEffect(() => {
        fetchOrders();
    }, [page, sortColumn, sortDirection, filters]);

    useEffect(() => {
        OrderService.getPaymentMethods().then(res => {
            if (res.data) {
                setPaymentMethods(res.data.map((pm: any) => ({ value: pm.title, label: pm.title })));
            }
        }).catch(console.error);
    }, []);

    const handleCancel = async (id: string) => {
        try {
            await OrderService.cancelOrder(id);
            fetchOrders();
        } catch (error) {
            console.error('Помилка скасування замовлення', error);
        }
    };

    const getStatusText = (order: OrderSummary) => {
        if (order.cancelled) return <span className="status-badge cancelled">Скасовано</span>;
        if (order.delivered) return <span className="status-badge delivered">Доставлено</span>;
        if (order.shipped) return <span className="status-badge shipped">Відправлено</span>;
        if (order.processing) return <span className="status-badge processing">В обробці</span>;
        if (order.ordered) return <span className="status-badge new">Нове</span>;
        return <span className="status-badge cart">Кошик</span>;
    };

    const columns: Column<OrderSummary>[] = [
        { key: 'number', title: 'Номер', sortable: true, filterable: true },
        { 
            key: 'created', 
            title: 'Створено', 
            sortable: true,
            render: (item) => new Date(item.created).toLocaleDateString()
        },
        { key: 'clientName', title: 'Клієнт', sortable: true, filterable: true },
        { key: 'city', title: 'Місто', sortable: true, filterable: true },
        { key: 'status', title: 'Статус', filterable: false, render: (item) => getStatusText(item) },
        { key: 'paymentMethodTitle', title: 'Оплата', sortable: true, filterable: true, filterOptions: paymentMethods },
        { key: 'totalPrice', title: 'Сума', sortable: true,
            render: (item) => <strong>{item.totalPrice.toFixed(2)} ₴</strong>
        },
        {
            key: 'actions',
            title: 'Дії',
            render: (item) => (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
                    <span 
                        title="Деталі" 
                        style={{ cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} 
                        onClick={(e) => { e.stopPropagation(); navigate(`/checkout?orderId=${item.id}`); }}
                    >
                        ⚙️
                    </span>
                    {!item.cancelled && !item.shipped && !item.delivered && (
                        <span 
                            title="Скасувати" 
                            style={{ cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if(window.confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
                                    handleCancel(item.id);
                                }
                            }}
                        >
                            ❌
                        </span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>Монітор замовлень</h1>
            </div>
            
            <Table 
                columns={columns}
                data={orders}
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                filters={filters}
                isLoading={isLoading}
                onPageChange={setPage}
                onSortChange={(col, dir) => {
                    setSortColumn(col);
                    setSortDirection(dir);
                    setPage(1); // Reset page on sort
                }}
                onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setPage(1); // Reset page on filter
                }}
                onRowClick={(item) => navigate(`/checkout?orderId=${item.id}`)}
            />
        </div>
    );
};

export default OrdersMonitor;
