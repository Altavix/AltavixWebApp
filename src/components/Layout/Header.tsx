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
            <span className="logo-placeholder">A</span>
            <span className="logo-text">ALTAVIX</span>
          </Link>
        </div>
        <nav className="nav">
          <ul>
            <li><NavLink to="/" end>Головна</NavLink></li>
            <li><a href="#">Про нас</a></li>
            <li><NavLink to="/catalog">Каталог</NavLink></li>
            <li><a href="#">Контакти</a></li>
            {isAuth && <span style={{display: 'none'}}>{/* Just a placeholder to use isAuth if needed */}</span>}
          </ul>
        </nav>
        <div className="header-actions">
          <AdminDropdown />
          <button className="icon-btn">🔍</button>
          
          <button className="icon-btn cart-btn" title="Кошик" onClick={toggleCart}>
            🛒
            {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
          </button>

          {isAuth ? (
            <UserDropdown />
          ) : (
            <Link to="/login" className="icon-btn" title="Увійти">👤</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
