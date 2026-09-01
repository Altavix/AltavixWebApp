import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import UserDropdown from './UserDropdown';
import AdminDropdown from './AdminDropdown';
import MobileDrawer from './MobileDrawer';
import '../../styles/components/Layout/Header.css';

const Header: React.FC = () => {
  const { isAuth } = useAuth();
  const { toggleCart, totalQuantity } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="mobile-menu-btn" onClick={() => setIsDrawerOpen(true)}>
            ☰
          </div>
          <div className="logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <img src="/logo/icon3.png" alt="Altavix Logo" style={{ height: '60px', objectFit: 'contain' }} className="header-logo-img" />
            </Link>
          </div>
          <nav className="nav desktop-only">
            <ul>
              <li><NavLink to="/" end>Головна</NavLink></li>
              <li><NavLink to="/about">Про нас</NavLink></li>
              <li><NavLink to="/catalog">Каталог</NavLink></li>
            </ul>
          </nav>
          <div className="header-actions">
            <div className="desktop-only-actions">
              <AdminDropdown />          
            </div>
            
            <button className="icon-btn cart-btn" title="Кошик" onClick={toggleCart}>
              <img src="/icons/cart.svg" alt="Кошик" style={{width: '24px', height: '24px'}} />
              {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
            </button>

            <div className="desktop-only-actions">
              {isAuth ? (
                <UserDropdown />
              ) : (
                <Link to="/login" className="icon-btn" title="Увійти">
                  <img src="/icons/profile.svg" alt="Профіль" style={{width: '24px', height: '24px'}} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default Header;
