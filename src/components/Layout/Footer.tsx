import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/Layout/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <Link to="/">
            <img src="/logo/icon3.png" alt="Altavix Logo" style={{ height: '60px', objectFit: 'contain' }} />
          </Link>
        </div>
        
        <div className="footer-contacts">
          <h3>Контакти</h3>
          
          <div className="contact-item">
            <img src="/icons/telephone.svg" alt="Телефон" className="contact-icon" />
            <div className="contact-phones">
              <a href="tel:+380937204195">093 720 41 95</a>
              <a href="tel:+380505947836">050 594 78 36</a>
            </div>
          </div>

          <div className="contact-messengers">
            <a href="viber://chat?number=%2B380505947836" title="Viber" target="_blank" rel="noopener noreferrer">
              <img src="/icons/viber.svg" alt="Viber" />
            </a>
            <a href="https://t.me/+380505947836" title="Telegram" target="_blank" rel="noopener noreferrer">
              <img src="/icons/telegram.svg" alt="Telegram" />
            </a>
            <a href="https://wa.me/380505947836" title="WhatsApp" target="_blank" rel="noopener noreferrer">
              <img src="/icons/whatsapp.svg" alt="WhatsApp" />
            </a>
          </div>

          <div className="contact-email">
            <img src="/icons/email.svg" alt="Email" style={{ width: '22px', height: '22px' }} />
            <a href="mailto:altavixpower@gmail.com">altavixpower@gmail.com</a>
          </div>
        </div>

        <div className="footer-nav">
          <ul>
            <li><Link to="/">Головна</Link></li>
            <li><Link to="/about">Про нас</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
          </ul>
        </div>
        
        {/* 
        <div className="footer-socials">
          <button className="social-btn">f</button>
          <button className="social-btn">in</button>
          <button className="social-btn">tg</button>
        </div> 
        */}
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Altavix. Всі права захищено. <span style={{ opacity: 0.5, marginLeft: '10px', fontSize: '0.85em' }}>v{import.meta.env.VITE_APP_VERSION}</span></p>
      </div>
    </footer>
  );
};

export default Footer;
