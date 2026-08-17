import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Layout/UserDropdown.css'; // Reusing UserDropdown styles for consistency

const AdminDropdown: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user || user.role !== 'Admin') return null;

    return (
        <div className="user-dropdown-container" ref={dropdownRef} style={{ marginLeft: '1rem' }}>
            <button className="user-dropdown-btn" onClick={toggleDropdown} style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)', borderRadius: '4px', padding: '0.4rem 0.75rem' }}>
                <span className="user-name">⚙️ Адмін панель</span>
                <span className="dropdown-arrow">▼</span>
            </button>
            
            {isOpen && (
                <div className="user-dropdown-menu">
                    <Link to="/admin/orders" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon">📊</span> Монітор замовлень
                    </Link>
                    <Link to="/admin/products" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon">📦</span> Товари
                    </Link>
                    <Link to="/admin/categories" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon">📑</span> Категорії
                    </Link>
                    <Link to="/admin/delivery" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon">🚚</span> Доставка
                    </Link>
                    <Link to="/admin/payment" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon">💳</span> Оплата
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AdminDropdown;
