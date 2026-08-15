import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/CartService';
import { useFetching } from '../../hooks/useFetching';
import OrderDetailsModal from '../../components/Profile/OrderDetailsModal';
import Loader from '../../components/UI/Loader';
import '../../styles/pages/Profile/OrdersListPage.css';

interface OrderSummary {
    id: string;
    number: number;
    created: string;
    updated?: string;
    ordered?: string;
    paid?: string;
    processing?: string;
    shipped?: string;
    delivered?: string;
    cancelled?: string;
    status: number;
    clientName: string;
    city?: string;
    address?: string;
    paymentMethodTitle?: string;
    totalPrice: number;
    totalPriceCoin: number;
    totalQuantity: number;
}

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Нове / Кошик', color: '#6b7280' },
    1: { label: 'Оформлено', color: '#3b82f6' },
    2: { label: 'В обробці', color: '#f59e0b' },
    3: { label: 'Оплачено', color: '#10b981' },
    4: { label: 'Відправлено', color: '#8b5cf6' },
    5: { label: 'Доставлено', color: '#059669' },
    6: { label: 'Скасовано', color: '#ef4444' }
};

const getStatusDate = (order: OrderSummary) => {
    if (order.status === 6 && order.cancelled) return new Date(order.cancelled).toLocaleString('uk-UA');
    if (order.status === 5 && order.delivered) return new Date(order.delivered).toLocaleString('uk-UA');
    if (order.status === 4 && order.shipped) return new Date(order.shipped).toLocaleString('uk-UA');
    if (order.status === 3 && order.paid) return new Date(order.paid).toLocaleString('uk-UA');
    if (order.status === 2 && order.processing) return new Date(order.processing).toLocaleString('uk-UA');
    if (order.status === 1 && order.ordered) return new Date(order.ordered).toLocaleString('uk-UA');
    return new Date(order.created).toLocaleString('uk-UA');
};

const OrdersListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
    const [fetchOrders, isLoading, error] = useFetching(async (clientId: string) => {
        const res = await OrderService.getOrdersList(clientId);
        return res;
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            const res = await fetchOrders(user.id);
            if (res.messageType === 'success' && res.data?.orders) {
                setOrders(res.data.orders);
            }
        };

        loadData();
    }, [user, navigate]);

    if (!user) return null;

    // Filter cart and past orders
    const cartOrder = orders.find(o => o.status === 0);
    const pastOrders = orders.filter(o => o.status !== 0);

    const hasActiveCart = cartOrder && cartOrder.totalQuantity > 0;

    return (
        <div className="orders-page">
            <div className="orders-container">
                <h1>Мої замовлення</h1>

                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : (
                    <div className="orders-list">
                        {hasActiveCart && (
                            <div className="order-row cart-row" onClick={() => setSelectedOrderId(cartOrder.id)} style={{ cursor: 'pointer' }}>
                                <div className="order-col col-number">
                                    <span className="col-label">Замовлення</span>
                                    <strong>№{cartOrder.number}</strong>
                                </div>
                                <div className="order-col col-qty">
                                    <span className="col-label">Кількість</span>
                                    <span>{cartOrder.totalQuantity} шт.</span>
                                </div>
                                <div className="order-col col-status">
                                    <span className="col-label">Статус</span>
                                    <span className="status-badge" style={{ backgroundColor: `${statusMap[0].color}15`, color: statusMap[0].color }}>
                                        🛒 Кошик
                                    </span>
                                </div>
                                <div className="order-col col-date">
                                    <span className="col-label">Створено</span>
                                    <span>{new Date(cartOrder.created).toLocaleDateString('uk-UA')}</span>
                                </div>
                                <div className="order-col col-price">
                                    <span className="col-label">Сума</span>
                                    <strong>{cartOrder.totalPrice.toFixed(2)} ₴</strong>
                                </div>
                                <div className="order-col col-action">
                                    <button 
                                        className="orders-checkout-btn" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/checkout');
                                        }}
                                    >
                                        Замовити
                                    </button>
                                </div>
                            </div>
                        )}

                        {pastOrders.length === 0 && !hasActiveCart ? (
                            <div className="empty-state">
                                <p>У вас ще немає замовлень.</p>
                                <button className="btn-primary" onClick={() => navigate('/catalog')}>Перейти до каталогу</button>
                            </div>
                        ) : (
                            pastOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    className="order-row" 
                                    onClick={() => setSelectedOrderId(order.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="order-col col-number">
                                        <span className="col-label">Замовлення</span>
                                        <strong>№{order.number}</strong>
                                    </div>
                                    <div className="order-col col-qty">
                                        <span className="col-label">Кількість</span>
                                        <span>{order.totalQuantity} шт.</span>
                                    </div>
                                    <div className="order-col col-status">
                                        <span className="col-label">Статус</span>
                                        <span className="status-badge" style={{ backgroundColor: `${statusMap[order.status].color}15`, color: statusMap[order.status].color }}>
                                            {statusMap[order.status].label}
                                        </span>
                                        <span className="status-date">{getStatusDate(order)}</span>
                                    </div>
                                    <div className="order-col col-address">
                                        <span className="col-label">Адреса та Оплата</span>
                                        <span className="address-text">{order.city ? `${order.city}, ${order.address}` : order.address || '—'}</span>
                                        <span className="payment-text">{order.paymentMethodTitle || '—'}</span>
                                    </div>
                                    <div className="order-col col-price">
                                        <span className="col-label">Сума</span>
                                        <strong>{order.totalPrice.toFixed(2)} ₴</strong>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedOrderId && (
                <OrderDetailsModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                />
            )}
        </div>
    );
};

export default OrdersListPage;
