import React from "react";
import "./OrderSummaryModal.css";

interface OrderSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    totalPrice: number;
    totalQuantity: number;
    deliveryPrice: number;
    deliveryMethodTitle: string;
    paymentMethodTitle: string;
    formData: {
        clientName: string;
        clientMobilePhone: string;
        clientEmail: string;
        city: string;
        address: string;
        comment: string;
    };
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    totalPrice,
    totalQuantity,
    deliveryPrice,
    deliveryMethodTitle,
    paymentMethodTitle,
    formData
}) => {
    if (!isOpen) return null;

    const finalTotal = totalPrice + deliveryPrice;

    return (
        <div className="summary-modal-overlay" onClick={onClose}>
            <div className="summary-modal-content" onClick={e => e.stopPropagation()}>
                <div className="summary-modal-header">
                    <h2>Підтвердження замовлення</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="summary-modal-body">
                    <div className="summary-section-title">Одержувач</div>
                    <div className="summary-item">
                        <span>ПІБ:</span>
                        <strong>{formData.clientName}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Телефон:</span>
                        <strong>{formData.clientMobilePhone}</strong>
                    </div>
                    {formData.clientEmail && (
                        <div className="summary-item">
                            <span>Email:</span>
                            <strong>{formData.clientEmail}</strong>
                        </div>
                    )}

                    <div className="summary-section-title">Доставка</div>
                    <div className="summary-item">
                        <span>Місто:</span>
                        <strong>{formData.city}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Адреса:</span>
                        <strong>{formData.address}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Спосіб:</span>
                        <strong>{deliveryMethodTitle || "Не вибрано"} {deliveryPrice > 0 ? `(${deliveryPrice.toFixed(2)} ₴)` : ""}</strong>
                    </div>

                    <div className="summary-section-title">Оплата та Коментар</div>
                    <div className="summary-item">
                        <span>Спосіб оплати:</span>
                        <strong>{paymentMethodTitle || "Не вибрано"}</strong>
                    </div>
                    {formData.comment && (
                        <div className="summary-item">
                            <span>Коментар:</span>
                            <strong>{formData.comment}</strong>
                        </div>
                    )}

                    <div className="summary-section-title">Підсумок</div>
                    <div className="summary-item">
                        <span>Кількість товарів:</span>
                        <strong>{totalQuantity} шт.</strong>
                    </div>
                    <div className="summary-item">
                        <span>Сума товарів:</span>
                        <strong>{totalPrice.toFixed(2)} ₴</strong>
                    </div>
                    
                    <div className="summary-total">
                        <span>До сплати:</span>
                        <span className="total-price">{finalTotal.toFixed(2)} ₴</span>
                    </div>
                </div>

                <div className="summary-modal-footer">
                    <button className="cancel-button" onClick={onClose} disabled={isLoading}>
                        Скасувати
                    </button>
                    <button className="confirm-button" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Обробка..." : "Підтвердити замовлення"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummaryModal;
