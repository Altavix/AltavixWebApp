import React from 'react';
import '../../styles/components/Layout/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          {/* Placeholder for the logo user uploaded */}
          <span className="logo-placeholder">A</span>
          <span className="logo-text">ALTAVIX</span>
        </div>
        <nav className="nav">
          <ul>
            <li><a href="#" className="active">Головна</a></li>
            <li><a href="#">Про нас</a></li>
            <li><a href="#">Рішення</a></li>
            <li><a href="#">Контакти</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-btn">🔍</button>
          <button className="icon-btn">👤</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
