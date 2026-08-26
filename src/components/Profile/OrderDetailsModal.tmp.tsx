import React, { useEffect, useState } from 'react';
import { OrderService, CartService, type DeliveryMethodVm, type PaymentMethodVm } from '../../services/CartService';
import Loader from '../UI/Loader';
import Button from '../UI/Button';
import Select from '../UI/Select/Select';
import OrderFormFields from '../Orders/OrderFormFields';
import SearchModal from '../UI/SearchModal';
import { formatDeliveryAddress } from '../../utils/orderUtils';
import '../../styles/pages/Profile/OrderDetailsModal.css';

interface OrderItem {
    id: string;
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    unitPriceCoin: number;
}

interface OrderDetails {
    id: string;
    number: number;
    created: string;
    status: number;
    clientName: string;
    clientMobilePhone: string;
    clientEmail: string | null;
    city: string | null;
    address: string | null;
    comment: string | null;
    deliveryMethodId: string | null;
    deliveryMethodTitle: string | null;
    paymentMethodId: string | null;
    paymentMethodTitle: string | null;
    totalPrice: number;
    totalPriceCoin: number;
    items: OrderItem[];
}

interface OrderDetailsModalProps {
    orderId: string;
    onClose: () => void;
}

import { useAuth } from '../../hooks/useAuth';

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Кошик', color: '#aaaaaa' },
    1: { label: 'Нове', color: '#aa66cc' },
    2: { label: 'В обробці', color: '#ffbb33' },
    3: { label: 'Оплачено', color: '#10b981' },
    4: { label: 'Відправлено', color: '#33b5e5' },
    5: { label: 'Доставлено', color: '#00C851' },
    6: { label: 'Скасовано', color: '#ff4444' }
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Edit Form State
    const [formData, setFormData] = useState<Partial<OrderDetails & { clientId: string | null }>>({});
    const [novaPoshtaType, setNovaPoshtaType] = useState<"branch" | "postomat">("branch");
    
    // Search Modal State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // Lists for dropdowns
    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodVm[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodVm[]>([]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await OrderService.getOrderById(orderId);
            if (response.data) {
                setOrder(response.data);
                
                // Initialize form data. Strip Nova Poshta prefixes if needed for clean editing
                let cleanAddress = response.data.address || "";
                if (cleanAddress.startsWith("Відділення №")) {
                    cleanAddress = cleanAddress.replace("Відділення №", "");
                    setNovaPoshtaType("branch");
                } else if (cleanAddress.startsWith("Поштомат №")) {
                    cleanAddress = cleanAddress.replace("Поштомат №", "");
                    setNovaPoshtaType("postomat");
                } else if (cleanAddress.startsWith("Відділення/Індекс: ")) {
                    cleanAddress = cleanAddress.replace("Відділення/Індекс: ", "");
                }
                
                setFormData({
                    ...response.data,
                    address: cleanAddress
                });
            } else {
                setError('Не вдалося завантажити деталі замовлення.');
            }
        } catch (err) {
            setError('Помилка сервера при завантаженні замовлення.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMethods = async () => {
        try {
            const [delRes, payRes] = await Promise.all([
                OrderService.getDeliveryMethods(),
                OrderService.getPaymentMethods()
            ]);
            if (delRes.data) setDeliveryMethods(delRes.data);
            if (payRes.data) setPaymentMethods(payRes.data);
        } catch (err) {
            console.error('Failed to load methods', err);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        fetchMethods();
    }, [orderId]);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!order) return;
        setSaving(true);
        try {
            const selectedDelivery = deliveryMethods.find(m => m.id === formData.deliveryMethodId);
            const finalAddress = formatDeliveryAddress(formData.address || "", selectedDelivery, novaPoshtaType);

            const payload = {
                clientId: formData.clientId,
                clientName: formData.clientName,
                clientMobilePhone: formData.clientMobilePhone,
                clientEmail: formData.clientEmail,
                city: formData.city,
                address: finalAddress,
                comment: formData.comment,
                deliveryMethodId: formData.deliveryMethodId,
                paymentMethodId: formData.paymentMethodId
            };
            
            const res = await OrderService.updateOrderDetails(orderId, payload, isAdmin);
            let statusRes = { messageType: 'success' };
            
            if (isAdmin && formData.status !== undefined && Number(formData.status) !== order.status) {
                statusRes = await OrderService.updateOrderStatus(orderId, Number(formData.status)) as any;
            }

            if (res.messageType === 'success' && (statusRes?.messageType === 'success' || statusRes?.messageType === undefined)) {
                await fetchOrderDetails(); // Refresh
                setIsEditing(false);
            } else {
                alert(res.message || 'Помилка при збереженні');
            }
        } catch (err) {
            alert('Помилка сервера');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelOrder = async () => {
        if (window.confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
            try {
                const res = await OrderService.cancelOrder(orderId);
                if (res.messageType === 'success') {
                    fetchOrderDetails();
                } else {
                    alert(res.message || 'Помилка при скасуванні');
                }
            } catch (err) {
                alert('Помилка сервера');
            }
        }
    };

    const handleItemQuantity = async (itemId: string, newQty: number) => {
        if (newQty < 1) return;
        try {
            await CartService.updateQuantity(orderId, itemId, newQty, isAdmin);
            fetchOrderDetails();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            await CartService.removeItem(orderId, itemId, isAdmin);
            fetchOrderDetails();
        } catch (err) {
            console.error(err);
        }
    };

    const canEdit = order && (isAdmin ? order.status <= 2 : order.status <= 1);

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Деталі замовлення</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <div className="error-msg">{error}</div>
                    ) : order ? (
                        <div className="order-details-view">
                            <div className="details-header">
                                <div>
                                    <h3>Замовлення №{order.number}</h3>
                                    <span className="text-muted">{new Date(order.created).toLocaleString('uk-UA')}</span>
                                </div>
                                <div className="header-actions">
                                    {isEditing && isAdmin ? (
                                        <div style={{ width: '200px' }}>
                                            <Select
                                                options={Object.entries(statusMap)
                                                    .filter(([val]) => val !== '0')
                                                    .map(([val, {label}]) => ({ key: val, value: label }))}
                                                selectedValue={String(formData.status ?? order.status)}
                                                onChange={(val) => handleSelectChange('status', val)}
                                                renderOption={(option) => (
                                                    <span className="status-badge" style={{ backgroundColor: `${statusMap[Number(option.key)]?.color || '#000'}15`, color: statusMap[Number(option.key)]?.color || '#000', width: '100%', display: 'inline-block', textAlign: 'center' }}>
                                                        {option.value}
                                                    </span>
                                                )}
                                                renderValue={(option) => (
                                                    <span className="status-badge" style={{ backgroundColor: `${statusMap[Number(option.key)]?.color || '#000'}15`, color: statusMap[Number(option.key)]?.color || '#000', margin: 0 }}>
                                                        {option.value}
                                                    </span>
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <span className="status-badge" style={{ backgroundColor: `${statusMap[order.status]?.color || '#000'}15`, color: statusMap[order.status]?.color || '#000' }}>
                                            {statusMap[order.status]?.label || 'Невідомо'}
                                        </span>
                                    )}
                                    {canEdit && !isEditing && (
                                        <button className="btn-edit" onClick={() => setIsEditing(true)}>✏️ Редагувати</button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="edit-form-wrapper" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-2.5rem', position: 'relative', zIndex: 10 }}>
                                        <Button 
                                            type="button" 
                                            variant="secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            onClick={() => setIsSearchOpen(true)}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>🔄 </span> Змінити клієнта
                                        </Button>
                                    </div>
                                    <OrderFormFields 
                                        formData={formData as any}
                                        deliveryMethods={deliveryMethods}
                                        paymentMethods={paymentMethods}
                                        novaPoshtaType={novaPoshtaType}
                                        setNovaPoshtaType={setNovaPoshtaType}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        showComment={true}
                                    />
                                    
                                    <SearchModal 
                                        isOpen={isSearchOpen}
                                        onClose={() => setIsSearchOpen(false)}
                                        apiMethod="/user/search"
                                        title="Пошук клієнта"
                                        mainField={(item) => `${item.lastName || ''} ${item.firstName || ''} ${item.middleName || ''}`.trim()}
                                        subField1="phoneNumber"
                                        subField2="email"
                                        onSelect={(user) => {
                                            const fullName = `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`.trim();
                                            setFormData(prev => ({
                                                ...prev,
                                                clientId: user.id,
                                                clientName: fullName,
                                                clientMobilePhone: user.phoneNumber,
                                                clientEmail: user.email
                                            }));
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="details-grid">
                                        <div className="details-card">
                                            <h4>Клієнт</h4>
                                            <p><strong>ПІБ:</strong> {order.clientName}</p>
                                            <p><strong>Телефон:</strong> {order.clientMobilePhone}</p>
                                            <p><strong>Email:</strong> {order.clientEmail || '—'}</p>
                                        </div>

                                        <div className="details-card">
                                            <h4>Доставка та оплата</h4>
                                            <p><strong>Місто:</strong> {order.city || '—'}</p>
                                            <p><strong>Адреса:</strong> {order.address || '—'}</p>
                                            <p><strong>Доставка:</strong> {order.deliveryMethodTitle || '—'}</p>
                                            <p><strong>Оплата:</strong> {order.paymentMethodTitle || '—'}</p>
                                        </div>
                                    </div>
                                    
                                    {order.comment && (
                                        <div className="details-card comment-card">
                                            <h4>Коментар до замовлення</h4>
                                            <p>{order.comment}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="items-section">
                                <h4>Товари в замовленні</h4>
                                <div className="items-table-container">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Назва товару</th>
                                                <th className="text-center">К-сть</th>
                                                <th className="text-right">Ціна</th>
                                                <th className="text-right">Сума</th>
                                                {isEditing && <th className="text-center">Дії</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.productTitle}</td>
                                                    <td className="text-center">
                                                        {isEditing ? (
                                                            <div className="qty-controls">
                                                                <button onClick={() => handleItemQuantity(item.id, item.quantity - 1)}>-</button>
                                                                <span>{item.quantity}</span>
                                                                <button onClick={() => handleItemQuantity(item.id, item.quantity + 1)}>+</button>
                                                            </div>
                                                        ) : (
                                                            `${item.quantity} шт.`
                                                        )}
                                                    </td>
                                                    <td className="text-right">{item.unitPrice.toFixed(2)} ₴</td>
                                                    <td className="text-right">{(item.unitPrice * item.quantity).toFixed(2)} ₴</td>
                                                    {isEditing && (
                                                        <td className="text-center">
                                                            <button className="btn-remove-item" onClick={() => handleRemoveItem(item.id)}>🗑️</button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {order.items.length === 0 && (
                                                <tr>
                                                    <td colSpan={isEditing ? 5 : 4} className="text-center">Кошик порожній</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="details-footer">
                                <div className="actions-left">
                                    <Button 
                                        variant="danger"
                                        onClick={canEdit && order.status !== 6 ? handleCancelOrder : undefined}
                                        disabled={!canEdit || order.status === 6}
                                    >
                                        Скасувати замовлення
                                    </Button>
                                    {(!canEdit && order.status !== 6) && (
                                        <p className="cancel-notice">Для скасування зв'яжіться з менеджером</p>
                                    )}
                                </div>
                                <div className="actions-right">
                                    {isEditing && (
                                        <div className="edit-actions">
                                            <Button variant="secondary" onClick={() => { setIsEditing(false); fetchOrderDetails(); }}>Відмінити</Button>
                                            <Button variant="primary" onClick={handleSave} isLoading={saving}>Зберегти зміни</Button>
                                        </div>
                                    )}
                                    <div className="total-price-box">
                                        <span>Загальна сума:</span>
                                        <h3>{order.totalPrice.toFixed(2)} ₴</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
