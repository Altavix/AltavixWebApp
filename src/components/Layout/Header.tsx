import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import UserDropdown from './UserDropdown';
import AdminDropdown from './AdminDropdown';
import '../../styles/components/Layout/Header.css';

const Header: React.FC = () => {
  const { isAuth } = useAuth();
  const { toggleCart, totalQuantity } = useCart();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo/icon3.png" alt="Altavix Logo" style={{ height: '60px', objectFit: 'contain' }} />
          </Link>
        </div>
        <nav className="nav">
          <ul>
            <li><NavLink to="/" end>Головна</NavLink></li>
            <li><NavLink to="/about">Про нас</NavLink></li>
            <li><NavLink to="/catalog">Каталог</NavLink></li>
            {isAuth && <span style={{display: 'none'}}>{/* Just a placeholder to use isAuth if needed */}</span>}
          </ul>
        </nav>
        <div className="header-actions">
          <AdminDropdown />          
          <button className="icon-btn cart-btn" title="Кошик" onClick={toggleCart}>
            <img src="/icons/cart.svg" alt="Кошик" style={{width: '24px', height: '24px'}} />
            {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
          </button>

          {isAuth ? (
            <UserDropdown />
          ) : (
            <Link to="/login" className="icon-btn" title="Увійти">
              <img src="/icons/profile.svg" alt="Профіль" style={{width: '24px', height: '24px'}} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
