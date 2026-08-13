import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import '../../styles/components/Cart/CartModal.css';

const CartModal: React.FC = () => {
    const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, totalPrice } = useCart();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        toggleCart();
        navigate('/checkout'); // We will create this page later
    };

    return (
        <>
            <div className="cart-backdrop" onClick={toggleCart}></div>
            <div className="cart-drawer">
                <div className="cart-header">
                    <h2>Кошик</h2>
                    <button className="close-btn" onClick={toggleCart}>&times;</button>
                </div>
                
                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <p>Ваш кошик порожній</p>
                        </div>
                    ) : (
                        <ul className="cart-items">
                            {items.map(item => (
                                <li key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <h4>{item.productTitle}</h4>
                                        <p className="item-price">
                                            {item.unitPrice},{item.unitPriceCoin.toString().padStart(2, '0')} ₴
                                        </p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Видалити">
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Загалом:</span>
                            <span>{totalPrice.toFixed(2).replace('.', ',')} ₴</span>
                        </div>
                        <button className="checkout-btn" onClick={handleCheckout}>
                            Замовити
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartModal;
