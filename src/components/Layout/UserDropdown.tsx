import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Layout/UserDropdown.css';

const UserDropdown: React.FC = () => {
    const { user, logout } = useAuth();
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

    if (!user) return null;

    return (
        <div className="user-dropdown-container" ref={dropdownRef}>
            <button className="user-dropdown-btn" onClick={toggleDropdown}>
                <span className="user-name">{user.name || user.email}</span>
                <span className="dropdown-arrow" style={{fontSize: '0.8em', marginLeft: '4px'}}>
                    {isOpen ? '▼' : '◀'}
                </span>
            </button>
            
            {isOpen && (
                <div className="user-dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon"><img src="/icons/profile.svg" alt="Профіль" style={{width: '16px', height: '16px'}} /></span> Профіль
                    </Link>
                    <Link to="/my-orders" className="dropdown-item" onClick={closeDropdown}>
                        <span className="icon"><img src="/icons/box.svg" alt="Мої замовлення" style={{width: '16px', height: '16px'}} /></span> Мої замовлення
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-btn" onClick={() => { closeDropdown(); logout(); }}>
                        <span className="icon"><img src="/icons/door.svg" alt="Вийти" style={{width: '16px', height: '16px'}} /></span> Вийти
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
