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
    updated: string | null;
    ordered: string | null;
    paid: string | null;
    processing: string | null;
    shipped: string | null;
    delivered: string | null;
    cancelled: string | null;
    clientName: string;
    city: string | null;
    address: string | null;
    paymentMethodTitle: string | null;
    deliveryMethodTitle: string | null;
    totalPrice: number;
    totalPriceCoin: number;
    totalQuantity: number;
    status: number;
}

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Кошик', color: '#aaaaaa' },
    1: { label: 'Нове', color: '#aa66cc' },
    2: { label: 'В обробці', color: '#ffbb33' },
    3: { label: 'Оплачено', color: '#10b981' },
    4: { label: 'Відправлено', color: '#33b5e5' },
    5: { label: 'Доставлено', color: '#00C851' },
    6: { label: 'Скасовано', color: '#ff4444' }
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
    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
    const [fetchOrders, isLoading, error] = useFetching(async (clientId: string) => {
        const res = await OrderService.getOrdersList(clientId);
        return res;
    });

    const loadData = async () => {
        if (!user) return;
        const res = await fetchOrders(user.id);
        if (res.messageType === 'success' && res.data?.orders) {
            setOrders(res.data.orders);
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        loadData();
    }, [user, isAuthLoading, navigate]);

    if (isAuthLoading) return <Loader />;
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
                                    <span className="col-label">ЗАМОВЛЕННЯ</span>
                                    <strong>№{cartOrder.number}</strong>
                                </div>
                                <div className="order-col col-qty">
                                    <span className="col-label">КІЛЬКІСТЬ</span>
                                    <span>{cartOrder.totalQuantity} шт.</span>
                                </div>
                                <div className="order-col col-status">
                                    <span className="col-label">СТАТУС</span>
                                    <span className="status-badge" style={{ backgroundColor: `${statusMap[0].color}15`, color: statusMap[0].color }}>
                                        🛒 Кошик
                                    </span>
                                </div>
                                <div className="order-col col-date">
                                    <span className="col-label">СТВОРЕНО</span>
                                    <span>{new Date(cartOrder.created).toLocaleDateString('uk-UA')}</span>
                                </div>
                                <div className="order-col col-price">
                                    <span className="col-label">СУМА</span>
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
                                        Оформити
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
                                        <span className="col-label">ЗАМОВЛЕННЯ</span>
                                        <strong>№{order.number}</strong>
                                    </div>
                                    <div className="order-col col-qty">
                                        <span className="col-label">КІЛЬКІСТЬ</span>
                                        <span>{order.totalQuantity} шт.</span>
                                    </div>
                                    <div className="order-col col-status">
                                        <span className="col-label">СТАТУС</span>
                                        <span className="status-badge" style={{ backgroundColor: `${statusMap[order.status].color}15`, color: statusMap[order.status].color }}>
                                            {statusMap[order.status].label}
                                        </span>
                                        <span className="status-date">{getStatusDate(order)}</span>
                                    </div>
                                    <div className="order-col col-address">
                                        <span className="col-label">АДРЕСА ТА ОПЛАТА</span>
                                        <span className="address-text">{order.city ? `${order.city}, ${order.address}` : order.address || '—'}</span>
                                        <span className="payment-text">{order.paymentMethodTitle || '—'}</span>
                                    </div>
                                    <div className="order-col col-price">
                                        <span className="col-label">СУМА</span>
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
                    onOrderUpdated={loadData}
                />
            )}
        </div>
    );
};

export default OrdersListPage;
