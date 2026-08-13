import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { OrderService } from "../../services/CartService";
import type { DeliveryMethodVm, PaymentMethodVm } from "../../services/CartService";
import { useFetching } from "../../hooks/useFetching";
import OrderSummaryModal from "./components/OrderSummaryModal";
import Select from "../../components/UI/Select/Select";
import "./CheckoutPage.css";

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orderId, items, totalPrice, totalQuantity, clearCart } = useCart();

    const [fetchDelivery] = useFetching<DeliveryMethodVm[]>(OrderService.getDeliveryMethods);
    const [fetchPayment] = useFetching<PaymentMethodVm[]>(OrderService.getPaymentMethods);
    const [fetchCheckout, isCheckingOut] = useFetching(OrderService.checkout);

    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodVm[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodVm[]>([]);

    const [formData, setFormData] = useState({
        clientName: "",
        clientMobilePhone: "",
        clientEmail: "",
        city: "",
        address: "",
        comment: "",
        deliveryMethodId: "",
        paymentMethodId: ""
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            navigate("/catalog");
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                clientName: user.username || "",
                clientEmail: user.email || ""
            }));
        }

        const loadMethods = async () => {
            const dRes = await fetchDelivery();
            if (dRes.messageType === "success" && dRes.data) {
                setDeliveryMethods(dRes.data);
                if (dRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, deliveryMethodId: dRes.data[0].id }));
                }
            }
            
            const pRes = await fetchPayment();
            if (pRes.messageType === "success" && pRes.data) {
                setPaymentMethods(pRes.data);
                if (pRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, paymentMethodId: pRes.data[0].id }));
                }
            }
        };

        loadMethods();
    }, [items.length, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleConfirmCheckout = async () => {
        if (!orderId) return;

        const result = await fetchCheckout({
            orderId,
            ...formData
        });

        if (result.messageType === "success") {
            clearCart();
            setIsModalOpen(false);
            navigate("/"); // Or success page
        }
    };

    const selectedDelivery = deliveryMethods.find(m => m.id === formData.deliveryMethodId);
    const selectedPayment = paymentMethods.find(m => m.id === formData.paymentMethodId);

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>Оформлення замовлення</h1>
                
                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={handleOpenModal}>
                        <section className="checkout-section">
                            <h2>Контактні дані</h2>
                            <div className="form-group">
                                <label>ПІБ *</label>
                                <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Телефон *</label>
                                <input type="tel" name="clientMobilePhone" value={formData.clientMobilePhone} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} />
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h2>Доставка</h2>
                            <div className="form-group">
                                <label>Місто *</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Адреса / Відділення *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group" style={{ position: "relative", zIndex: 10 }}>
                                <Select 
                                    label="Спосіб доставки *"
                                    options={deliveryMethods.map(m => ({ 
                                        value: m.id, 
                                        label: `${m.title} ${m.price > 0 ? `(+${m.price.toFixed(2)} ₴)` : ""}` 
                                    }))}
                                    selectedValue={formData.deliveryMethodId}
                                    onChange={(value) => handleSelectChange('deliveryMethodId', value)}
                                />
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h2>Оплата</h2>
                            <div className="form-group" style={{ position: "relative", zIndex: 5 }}>
                                <Select 
                                    label="Спосіб оплати *"
                                    options={paymentMethods.map(m => ({ 
                                        value: m.id, 
                                        label: m.title 
                                    }))}
                                    selectedValue={formData.paymentMethodId}
                                    onChange={(value) => handleSelectChange('paymentMethodId', value)}
                                />
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h2>Коментар</h2>
                            <div className="form-group">
                                <textarea name="comment" value={formData.comment} onChange={handleInputChange} rows={3} placeholder="Додайте коментар до замовлення (необов'язково)"></textarea>
                            </div>
                        </section>

                        <button type="submit" className="checkout-submit-btn">Замовити</button>
                    </form>

                    <aside className="checkout-sidebar">
                        <h2>Ваше замовлення</h2>
                        <div className="checkout-items">
                            {items.map(item => (
                                <div key={item.id} className="checkout-item">
                                    <div className="item-details">
                                        <span className="item-title">{item.productTitle}</span>
                                        <span className="item-qty">{item.quantity} шт.</span>
                                    </div>
                                    <span className="item-price">{(item.unitPrice * item.quantity).toFixed(2)} ₴</span>
                                </div>
                            ))}
                        </div>
                        <div className="checkout-summary-box">
                            <div className="summary-row">
                                <span>Разом:</span>
                                <strong>{totalPrice.toFixed(2)} ₴</strong>
                            </div>
                            <div className="summary-row">
                                <span>Доставка:</span>
                                <strong>{selectedDelivery?.price ? `+${selectedDelivery.price.toFixed(2)} ₴` : "За тарифами"}</strong>
                            </div>
                            <div className="summary-row total">
                                <span>До сплати:</span>
                                <span>{(totalPrice + (selectedDelivery?.price || 0)).toFixed(2)} ₴</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <OrderSummaryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCheckout}
                isLoading={isCheckingOut}
                totalPrice={totalPrice}
                totalQuantity={totalQuantity}
                deliveryPrice={selectedDelivery?.price || 0}
                deliveryMethodTitle={selectedDelivery?.title || ""}
                paymentMethodTitle={selectedPayment?.title || ""}
                formData={formData}
            />
        </div>
    );
};

export default CheckoutPage;
