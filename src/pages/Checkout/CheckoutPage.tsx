import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { OrderService } from "../../services/CartService";
import type { DeliveryMethodVm, PaymentMethodVm } from "../../services/CartService";
import { useFetching } from "../../hooks/useFetching";
import { UserService } from "../../services/UserService";
import OrderSummaryModal from "./components/OrderSummaryModal";
import OrderFormFields from "../../components/Orders/OrderFormFields";
import { formatDeliveryAddress } from "../../utils/orderUtils";
import '../../styles/pages/Checkout/CheckoutPage.css';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orderId, orderNumber, items, totalPrice, totalQuantity, clearCart } = useCart();

    const [fetchDelivery] = useFetching<DeliveryMethodVm[]>(OrderService.getDeliveryMethods);
    const [fetchPayment] = useFetching<PaymentMethodVm[]>(OrderService.getPaymentMethods);
    const [fetchCheckout, isCheckingOut] = useFetching(OrderService.checkout);

    const [fetchProfile] = useFetching(async (id: string) => {
        const response = await UserService.getUserProfile(id);
        if (response.data) {
            const fullName = `${response.data.lastName || ''} ${response.data.firstName || ''} ${response.data.middleName || ''}`.trim();
            setFormData(prev => ({
                ...prev,
                clientName: fullName || prev.clientName,
                clientEmail: response.data.email || prev.clientEmail,
                clientMobilePhone: response.data.phoneNumber || user?.phoneNumber || prev.clientMobilePhone
            }));
        }
    });

    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodVm[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodVm[]>([]);

    const [novaPoshtaType, setNovaPoshtaType] = useState<"branch" | "postomat">("branch");

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
                clientName: user.name || "",
                clientEmail: user.email || "",
                clientMobilePhone: user.phoneNumber || ""
            }));
            fetchProfile(user.id);
        }

        const loadMethods = async () => {
            const dRes = await fetchDelivery();
            if (dRes.messageType === "success" && dRes.data) {
                setDeliveryMethods(dRes.data);
                if (dRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, deliveryMethodId: dRes.data![0].id }));
                }
            }
            
            const pRes = await fetchPayment();
            if (pRes.messageType === "success" && pRes.data) {
                setPaymentMethods(pRes.data);
                if (pRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, paymentMethodId: pRes.data![0].id }));
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

    const selectedDelivery = deliveryMethods.find(m => m.id === formData.deliveryMethodId);
    const selectedPayment = paymentMethods.find(m => m.id === formData.paymentMethodId);

    const handleConfirmCheckout = async () => {
        if (!orderId) return;

        const finalAddress = formatDeliveryAddress(formData.address, selectedDelivery, novaPoshtaType);

        const result = await fetchCheckout({
            orderId,
            ...formData,
            address: finalAddress
        });

        if (result.messageType === "success") {
            clearCart();
            setIsModalOpen(false);
            navigate("/"); // Or success page
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>{orderNumber ? `Оформлення замовлення №${orderNumber}` : 'Оформлення замовлення'}</h1>
                
                <div className="checkout-layout">
                    <div className="checkout-main-content">
                        {!user && (
                            <div className="checkout-login-prompt">
                                <span>Вже маєте акаунт? Авторизуйтесь для зручнішого оформлення.</span>
                                <button className="btn-secondary" onClick={() => navigate('/login?redirect=/checkout')}>Увійти</button>
                            </div>
                        )}
                        <form className="checkout-form" onSubmit={handleOpenModal}>
                        <OrderFormFields
                            formData={formData}
                            deliveryMethods={deliveryMethods}
                            paymentMethods={paymentMethods}
                            novaPoshtaType={novaPoshtaType}
                            setNovaPoshtaType={setNovaPoshtaType}
                            onInputChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            showComment={true}
                        />
                        <button type="submit" className="checkout-submit-btn" style={{ marginTop: '2rem' }}>Замовити</button>
                    </form>
                    </div>

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
                orderNumber={orderNumber}
                totalPrice={totalPrice}
                totalQuantity={totalQuantity}
                deliveryPrice={selectedDelivery?.price || 0}
                deliveryMethodTitle={selectedDelivery?.title || ""}
                paymentMethodTitle={selectedPayment?.title || ""}
                formData={{
                    ...formData,
                    address: formatDeliveryAddress(formData.address, selectedDelivery, novaPoshtaType)
                }}
            />
        </div>
    );
};

export default CheckoutPage;
