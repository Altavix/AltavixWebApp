import React, { useEffect, useState } from 'react';
import { OrderService, CartService, type DeliveryMethodVm, type PaymentMethodVm } from '../../services/CartService';
import Loader from '../UI/Loader';
import Button from '../UI/Button';
import Select from '../UI/Select/Select';
import OrderFormFields from '../Orders/OrderFormFields';
import SearchModal from '../UI/SearchModal';
import ConfirmModal from '../UI/Modal/ConfirmModal';
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
    ordered?: string | null;
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
    onOrderUpdated?: () => void;
}

import { useAuth } from '../../hooks/useAuth';
import { useFetching } from '../../hooks/useFetching';

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Кошик', color: '#aaaaaa' },
    1: { label: 'Нове', color: '#aa66cc' },
    2: { label: 'В обробці', color: '#ffbb33' },
    3: { label: 'Оплачено', color: '#10b981' },
    4: { label: 'Відправлено', color: '#33b5e5' },
    5: { label: 'Доставлено', color: '#00C851' },
    6: { label: 'Скасовано', color: '#ff4444' }
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose, onOrderUpdated }) => {
    const [wasUpdated, setWasUpdated] = useState(false);

    const handleCloseModal = () => {
        if (wasUpdated && onOrderUpdated) {
            onOrderUpdated();
        }
        onClose();
    };
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [formData, setFormData] = useState<Partial<OrderDetails & { clientId: string | null }>>({});
    const [novaPoshtaType, setNovaPoshtaType] = useState<"branch" | "postomat">("branch");
    
    // Search Modal State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    
    // Lists for dropdowns
    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodVm[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodVm[]>([]);

    const [fetchOrderDetails, loading] = useFetching(async () => {
        const response = await OrderService.getOrderById(orderId);
        if (response?.data) {
            setOrder(response.data);
            
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
        }
        setInitialLoad(false);
        return response;
    });

    const [fetchMethods] = useFetching(async () => {
        const [delRes, payRes] = await Promise.all([
            OrderService.getDeliveryMethods(),
            OrderService.getPaymentMethods()
        ]);
        if (delRes?.data) setDeliveryMethods(delRes.data);
        if (payRes?.data) setPaymentMethods(payRes.data);
        return { data: { messageType: 'success' } };
    });

    useEffect(() => {
        fetchOrderDetails();
        fetchMethods();
    }, [orderId]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [handleSave, saving] = useFetching(async () => {
        if (!order) return;
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
        
        if (isAdmin && formData.status !== undefined && Number(formData.status) !== order.status) {
            await OrderService.updateOrderStatus(orderId, Number(formData.status));
        }

        if (res?.data?.messageType === 'success') {
            setWasUpdated(true);
            await fetchOrderDetails();
            setIsEditing(false);
        }
        
        return res;
    });

    const [handleCancelOrder, isCanceling] = useFetching(async () => {
        let res;
        if (isAdmin) {
            res = await OrderService.updateOrderStatus(orderId, 6);
        } else {
            res = await OrderService.cancelOrder(orderId);
        }
        setWasUpdated(true);
        await fetchOrderDetails();
        return res;
    });

    const [handleItemQuantity, isUpdatingQty] = useFetching(async (itemId: string, newQty: number) => {
        if (newQty < 1) return;
        const res = await CartService.updateQuantity(orderId, itemId, newQty, isAdmin);
        setWasUpdated(true);
        await fetchOrderDetails();
        return res;
    });

    const [handleRemoveItem, isRemovingItem] = useFetching(async (itemId: string) => {
        const res = await CartService.removeItem(orderId, itemId, isAdmin);
        setWasUpdated(true);
        await fetchOrderDetails();
        return res;
    });

    const canEdit = order && (isAdmin ? order.status <= 2 : order.status <= 1);

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Деталі замовлення</h2>
                    <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {initialLoad || (loading && !order) ? (
                        <Loader />
                    ) : !order ? (
                        <div className="error-msg">Не вдалося завантажити деталі замовлення.</div>
                    ) : (
                        <div className="order-details-view">
                            <div className="details-header">
                                <div>
                                    <h3>Замовлення №{order.number}</h3>
                                    <span className="text-muted">{new Date(order.ordered ? order.ordered : order.created).toLocaleString('uk-UA')}</span>
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
                                    {isAdmin && (
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
                                    )}
                                    <OrderFormFields 
                                        formData={formData as any}
                                        deliveryMethods={deliveryMethods}
                                        paymentMethods={paymentMethods}
                                        novaPoshtaType={novaPoshtaType as any}
                                        setNovaPoshtaType={setNovaPoshtaType as any}
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
                                                                <button disabled={isUpdatingQty} onClick={() => handleItemQuantity(item.id, item.quantity - 1)}>-</button>
                                                                <span>{item.quantity}</span>
                                                                <button disabled={isUpdatingQty} onClick={() => handleItemQuantity(item.id, item.quantity + 1)}>+</button>
                                                            </div>
                                                        ) : (
                                                            `${item.quantity} шт.`
                                                        )}
                                                    </td>
                                                    <td className="text-right">{item.unitPrice.toFixed(2)} ₴</td>
                                                    <td className="text-right">{(item.unitPrice * item.quantity).toFixed(2)} ₴</td>
                                                    {isEditing && (
                                                        <td className="text-center">
                                                            <button disabled={isRemovingItem} className="btn-remove-item" onClick={() => handleRemoveItem(item.id)}>
                                                                {isRemovingItem ? '...' : '🗑️'}
                                                            </button>
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
                                        onClick={canEdit && order.status !== 6 ? () => setIsCancelConfirmOpen(true) : undefined}
                                        disabled={!canEdit || order.status === 6 || isCanceling}
                                        isLoading={isCanceling}
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
                    )}
                </div>
            </div>
            
            <ConfirmModal
                isOpen={isCancelConfirmOpen}
                onClose={() => setIsCancelConfirmOpen(false)}
                title="Скасування замовлення"
                message="Ви дійсно впевнені, що хочете скасувати це замовлення? Цю дію неможливо відмінити."
                onConfirm={handleCancelOrder}
                confirmText="Скасувати замовлення"
                cancelText="Ні, повернутися"
                isDestructive={true}
            />
        </div>
    );
};

export default OrderDetailsModal;


