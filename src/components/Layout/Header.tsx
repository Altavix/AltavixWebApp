import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import '../../styles/components/Layout/Header.css';

const Header: React.FC = () => {
  const { isAuth, user, logout } = useAuth();
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
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-btn">🔍</button>
          
          <button className="icon-btn cart-btn" title="Кошик" onClick={toggleCart}>
            🛒
            {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
          </button>

          {isAuth ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</span>
              <button className="icon-btn" onClick={logout} title="Вийти">🚪</button>
            </div>
          ) : (
            <Link to="/login" className="icon-btn" title="Увійти">👤</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
