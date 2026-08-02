import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Layout/Header.css';

const Header: React.FC = () => {
  const { isAuth, user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          {/* Placeholder for the logo user uploaded */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-placeholder">A</span>
            <span className="logo-text">ALTAVIX</span>
          </Link>
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/" className="active">Головна</Link></li>
            <li><a href="#">Про нас</a></li>
            <li><a href="#">Каталог</a></li>
            <li><a href="#">Контакти</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-btn">🔍</button>
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
