import React from 'react';
import Select from '../UI/Select/Select';
import type { DeliveryMethodVm, PaymentMethodVm } from '../../services/CartService';
import '../../styles/components/Orders/OrderFormFields.css';

export interface OrderFormData {
    clientName: string;
    clientMobilePhone: string;
    clientEmail: string | null;
    city: string | null;
    address: string | null;
    comment: string | null;
    deliveryMethodId: string | null;
    paymentMethodId: string | null;
}

interface OrderFormFieldsProps {
    formData: Partial<OrderFormData>;
    deliveryMethods: DeliveryMethodVm[];
    paymentMethods: PaymentMethodVm[];
    novaPoshtaType: "branch" | "postomat";
    setNovaPoshtaType: (type: "branch" | "postomat") => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: keyof OrderFormData, value: string) => void;
    showComment?: boolean;
}

const OrderFormFields: React.FC<OrderFormFieldsProps> = ({
    formData,
    deliveryMethods,
    paymentMethods,
    novaPoshtaType,
    setNovaPoshtaType,
    onInputChange,
    onSelectChange,
    showComment = true
}) => {
    const selectedDelivery = deliveryMethods.find(m => m.id === formData.deliveryMethodId);

    return (
        <div className="order-form-fields">
            <section className="form-section">
                <h3>Контактні дані</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>ПІБ *</label>
                        <input type="text" name="clientName" value={formData.clientName || ''} onChange={onInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Телефон *</label>
                        <input type="tel" name="clientMobilePhone" value={formData.clientMobilePhone || ''} onChange={onInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="clientEmail" value={formData.clientEmail || ''} onChange={onInputChange} />
                    </div>
                </div>
            </section>

            <section className="form-section">
                <h3>Доставка</h3>
                <div className="form-grid">
                    <div className="form-group select-high-z">
                        <Select 
                            label="Спосіб доставки *"
                            options={deliveryMethods.map(m => ({ 
                                key: m.id, 
                                value: `${m.title} ${m.price > 0 ? `(+${m.price.toFixed(2)} ₴)` : ""}` 
                            }))}
                            selectedValue={formData.deliveryMethodId || ''}
                            onChange={(value) => onSelectChange('deliveryMethodId', value)}
                            placeholder="Оберіть доставку..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Місто *</label>
                        <input type="text" name="city" value={formData.city || ''} onChange={onInputChange} required />
                    </div>
                </div>

                <div className="form-grid mt-3">
                    {selectedDelivery?.type === 2 ? (
                        <>
                            <div className="form-group select-medium-z">
                                <Select 
                                    label="Тип *"
                                    options={[
                                        { key: "branch", value: "На відділення" },
                                        { key: "postomat", value: "На поштомат" }
                                    ]}
                                    selectedValue={novaPoshtaType}
                                    onChange={(val) => setNovaPoshtaType(val as "branch" | "postomat")}
                                />
                            </div>
                            <div className="form-group">
                                <label>{novaPoshtaType === "branch" ? "Номер відділення *" : "Номер поштомату *"}</label>
                                <input type="text" name="address" value={formData.address || ''} onChange={onInputChange} required placeholder="наприклад, 42" />
                            </div>
                        </>
                    ) : selectedDelivery?.type === 5 ? (
                        <div className="form-group full-width">
                            <label>Номер відділення або індекс *</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={onInputChange} required placeholder="наприклад, 01001" />
                        </div>
                    ) : (
                        <div className="form-group full-width">
                            <label>{[3, 4, 6].includes(selectedDelivery?.type || 0) ? 'Адреса *' : 'Адреса / Відділення *'}</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={onInputChange} required />
                        </div>
                    )}
                </div>
            </section>

            <section className="form-section">
                <h3>Оплата</h3>
                <div className="form-group select-low-z">
                    <Select 
                        label="Спосіб оплати *"
                        options={paymentMethods.map(m => ({ 
                            key: m.id, 
                            value: m.title 
                        }))}
                        selectedValue={formData.paymentMethodId || ''}
                        onChange={(value) => onSelectChange('paymentMethodId', value)}
                        placeholder="Оберіть оплату..."
                    />
                </div>
            </section>

            {showComment && (
                <section className="form-section">
                    <h3>Коментар</h3>
                    <div className="form-group">
                        <textarea 
                            name="comment" 
                            value={formData.comment || ''} 
                            onChange={onInputChange} 
                            rows={3} 
                            placeholder="Додайте коментар до замовлення (необов'язково)"
                        />
                    </div>
                </section>
            )}
        </div>
    );
};

export default OrderFormFields;
