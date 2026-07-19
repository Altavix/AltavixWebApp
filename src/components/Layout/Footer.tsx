import React from 'react';
import '../../styles/components/Layout/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <span className="logo-placeholder">A</span>
          <span className="logo-text">ALTAVIX</span>
        </div>
        
        <div className="footer-contacts">
          <h3>Контакти</h3>
          <p>📞 +380 97 123 4567</p>
          <p>✉️ info@altavix.ua</p>
        </div>

        <div className="footer-nav">
          <ul>
            <li><a href="#">Головна</a></li>
            <li><a href="#">Про нас</a></li>
            <li><a href="#">Блог</a></li>
            <li><a href="#">Контакти</a></li>
          </ul>
        </div>
        
        <div className="footer-socials">
          <button className="social-btn">f</button>
          <button className="social-btn">in</button>
          <button className="social-btn">tg</button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Altavix. Всі права захищено.</p>
      </div>
    </footer>
  );
};

export default Footer;
