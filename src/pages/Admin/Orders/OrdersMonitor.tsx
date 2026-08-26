import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Table } from '../../../components/UI/Table/Table';
import type { Column } from '../../../components/UI/Table/Table';
import { useFetching } from '../../../hooks/useFetching';
import { OrderService } from '../../../services/CartService';
import { Link, useNavigate } from 'react-router-dom';
import OrderDetailsModal from '../../../components/Profile/OrderDetailsModal';
import '../../../styles/pages/Admin/OrdersMonitor.css';

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
    const [sortColumn, setSortColumn] = useState<string>('created');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState<Record<string, string>>({});
    
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const [paymentMethods, setPaymentMethods] = useState<{key: string, value: string}[]>([]);
    const [deliveryMethods, setDeliveryMethods] = useState<{key: string, value: string}[]>([]);

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
        OrderService.getPaymentMethodOptions().then(res => {
            if (res.data) setPaymentMethods(res.data);
        }).catch(console.error);
        
        OrderService.getDeliveryMethodOptions().then(res => {
            if (res.data) setDeliveryMethods(res.data);
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

    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const [activeStatusMenu, setActiveStatusMenu] = useState<string | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveStatusMenu(null);
                setMenuPosition(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChangeStatus = async (orderId: string, newStatus: number) => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus);
            setActiveStatusMenu(null);
            setMenuPosition(null);
            fetchOrders();
        } catch (error) {
            console.error('Помилка зміни статусу', error);
        }
    };

    const statusChangeOptions = [
        { label: 'Нове', value: 1, badgeClass: 'new' },
        { label: 'В обробці', value: 2, badgeClass: 'processing' },
        { label: 'Відправлено', value: 4, badgeClass: 'shipped' },
        { label: 'Доставлено', value: 5, badgeClass: 'delivered' },
        { label: 'Скасовано', value: 6, badgeClass: 'cancelled' }
    ];

    const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>, orderId: string) => {
        e.stopPropagation();
        if (activeStatusMenu === orderId) {
            setActiveStatusMenu(null);
            setMenuPosition(null);
            return;
        }
        
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX
        });
        setActiveStatusMenu(orderId);
    };

    const getStatusText = (order: OrderSummary) => {
        let badge = <span className="status-badge cart">Кошик</span>;
        if (order.cancelled) badge = <span className="status-badge cancelled">Скасовано</span>;
        else if (order.delivered) badge = <span className="status-badge delivered">Доставлено</span>;
        else if (order.shipped) badge = <span className="status-badge shipped">Відправлено</span>;
        else if (order.processing) badge = <span className="status-badge processing">В обробці</span>;
        else if (order.ordered) badge = <span className="status-badge new">Нове</span>;

        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div 
                    onClick={(e) => handleMenuClick(e, order.id)}
                    style={{ cursor: 'pointer' }}
                >
                    {badge}
                </div>
            </div>
        );
    };

    const statusOptions = [
        { key: 'Нове', value: 'Нове' },
        { key: 'В обробці', value: 'В обробці' },
        { key: 'Відправлено', value: 'Відправлено' },
        { key: 'Доставлено', value: 'Доставлено' },
        { key: 'Скасовано', value: 'Скасовано' }
    ];

    const columns: Column<OrderSummary>[] = [
        { key: 'number', title: 'Номер', sortable: true, filterable: true, filterType: 'text' },
        { 
            key: 'created', 
            title: 'Створено', 
            sortable: true,
            filterable: true,
            filterType: 'dateRange',
            render: (item) => new Date(item.created).toLocaleDateString()
        },
        { key: 'clientName', title: 'Клієнт', sortable: true, filterable: true, filterType: 'text' },
        { key: 'city', title: 'Місто', sortable: true, filterable: true, filterType: 'text' },
        { key: 'status', title: 'Статус', sortable: true, filterable: true, filterType: 'select', filterOptions: statusOptions, render: (item) => getStatusText(item) },
        { key: 'paymentMethodTitle', title: 'Спосіб оплати', sortable: true, filterable: true, filterType: 'select', filterOptions: paymentMethods },
        { key: 'deliveryMethodTitle', title: 'Спосіб доставки', sortable: true, filterable: true, filterType: 'select', filterOptions: deliveryMethods },
        { key: 'totalPrice', title: 'Сума', sortable: true, filterable: true, filterType: 'numberRange',
            render: (item) => <strong>{item.totalPrice.toFixed(2)} ₴</strong>
        },
        {
            key: 'actions',
            title: 'Дії',
            render: (item) => (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-start' }}>
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
                onRowClick={(item) => setSelectedOrderId(item.id)}
            />

            {selectedOrderId && (
                <OrderDetailsModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                    onOrderUpdated={fetchOrders}
                />
            )}

            {activeStatusMenu && menuPosition && createPortal(
                <div 
                    ref={menuRef} 
                    className="status-context-menu" 
                    style={{ 
                        position: 'absolute', 
                        top: menuPosition.top, 
                        left: menuPosition.left, 
                        margin: 0, 
                        zIndex: 99999 
                    }}
                >
                    {statusChangeOptions.map(opt => (
                        <div 
                            key={opt.value} 
                            className="status-menu-item"
                            onClick={(e) => { e.stopPropagation(); handleChangeStatus(activeStatusMenu, opt.value); }}
                        >
                            <span className={`status-badge ${opt.badgeClass}`}>{opt.label}</span>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default OrdersMonitor;

