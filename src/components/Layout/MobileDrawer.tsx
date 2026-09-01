import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Layout/MobileDrawer.css';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { isAuth, user, logout } = useAuth();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" onClick={onClose}>
            <img src="/logo/icon3.png" alt="Altavix Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </Link>
          <button className="drawer-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-content">
          <nav className="drawer-nav">
            <ul>
              <li><NavLink to="/" end onClick={onClose}>Головна</NavLink></li>
              <li><NavLink to="/about" onClick={onClose}>Про нас</NavLink></li>
              <li><NavLink to="/catalog" onClick={onClose}>Каталог</NavLink></li>
            </ul>
          </nav>

          <div className="drawer-divider"></div>

          <div className="drawer-user-section">
            {isAuth && user ? (
              <>
                <div className="drawer-user-info">
                  <span className="drawer-user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </span>
                  <span className="drawer-user-name">{user.name || user.email}</span>
                </div>
                <div className="drawer-user-links">
                  <Link to="/profile" onClick={onClose}>Профіль</Link>
                  <Link to="/my-orders" onClick={onClose}>Мої замовлення</Link>
                  {user.role === 'Admin' && (
                    <Link to="/admin/orders" onClick={onClose} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      ⚙️ Адмін панель
                    </Link>
                  )}
                  <button onClick={() => { logout(); onClose(); }} className="drawer-logout-btn">Вийти</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="drawer-login-btn" onClick={onClose}>
                Увійти в акаунт
              </Link>
            )}
          </div>

          <div className="drawer-divider"></div>

          <div className="drawer-contacts">
            <h3>Контакти</h3>
            <div className="drawer-contact-item">
              <img src="/icons/telephone.svg" alt="Телефон" className="drawer-contact-icon" />
              <div className="drawer-phones">
                <a href="tel:+380937204195">093 720 41 95</a>
                <a href="tel:+380505947204">050 594 72 04</a>
              </div>
            </div>
            
            <div className="drawer-messengers">
              <span><img src="/icons/viber.svg" alt="Viber" /></span>
              <span><img src="/icons/telegram.svg" alt="Telegram" /></span>
              <span><img src="/icons/whatsapp.svg" alt="WhatsApp" /></span>
            </div>
            
            <div className="drawer-contact-email">
              <img src="/icons/email.svg" alt="Email" className="drawer-contact-icon-colored" />
              <a href="mailto:altavixpower@gmail.com">altavixpower@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
