import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import '../styles/pages/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Енергія там, де ти!</h1>
            <p className="hero-subtitle">
              Найкращі мобільні зарядні станції від світових брендів. 
              Забезпечте надійне живлення в будь-яких умовах зі швидкою доставкою по Україні.
            </p>
            <Button variant="secondary" onClick={() => navigate('/catalog')}>ПЕРЕГЛЯНУТИ КАТАЛОГ</Button>
          </div>
          <div className="hero-image-container">
            <img src="/home_page/home_pct1.jpg" alt="Зарядна станція" />
          </div>
        </div>
      </section>

      {/* ABOUT COMPANY CARDS */}
      <section className="about-section container">
        <h2 className="section-title">ЧОМУ ОБИРАЮТЬ ALTAVIX</h2>
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-image-container">
              <img src="/home_page/home_pct2.jpg" alt="Широкий асортимент" />
            </div>
            <h3>Широкий асортимент</h3>
            <p>Ми пропонуємо оригінальні портативні електростанції від провідних виробників: EcoFlow, Jackery, Bluetti та інших.</p>
          </div>
          
          <div className="info-card">
            <div className="card-image-container">
              <img src="/home_page/home_pct3.jpg" alt="Сертифікований товар" />
            </div>
            <h3>Сертифікований товар</h3>
            <p>Тільки офіційна та перевірена продукція. Ми гарантуємо 100% оригінальність кожного пристрою, який ви купуєте.</p>
          </div>

          <div className="info-card">
            <div className="card-image-container">
              <img src="/home_page/home_pct4.jpg" alt="Конкурентні ціни" />
            </div>
            <h3>Конкурентні ціни</h3>
            <p>Пряма співпраця з дистриб'юторами дозволяє нам пропонувати найкращі ціни на ринку.</p>
          </div>

          <div className="info-card">
            <div className="card-image-container">
              <img src="/home_page/home_pct5.jpg" alt="Власний склад" />
            </div>
            <h3>Власний склад</h3>
            <p>Всі товари знаходяться на нашому складі в Україні, що гарантує максимально швидке відвантаження ваших замовлень.</p>
          </div>
        </div>
      </section>

      {/* USE CASES SECTION (Replacing Advantages) */}
      <section className="advantages-section">
        <div className="container">
          <h2 className="section-title">ДЛЯ ЧОГО ВАМ ПОТРІБНА СТАНЦІЯ</h2>
          <div className="advantages-grid">
            <div className="advantage-item">
              <span className="adv-icon"><img src="/icons/house.svg" alt="Для дому" style={{width: '40px', height: '40px'}}/></span>
              <div>
                <h4>Для дому та квартири</h4>
                <p>Живлення газового котла, холодильника, роутера та освітлення під час тривалих відключень.</p>
              </div>
            </div>
            <div className="advantage-item">
              <span className="adv-icon"><img src="/icons/laptop.svg" alt="Для роботи" style={{width: '40px', height: '40px'}}/></span>
              <div>
                <h4>Для роботи та бізнесу</h4>
                <p>Безперебійна робота комп'ютерів, касових апаратів, терміналів та зарядка телефонів команди.</p>
              </div>
            </div>
            <div className="advantage-item">
              <span className="adv-icon"><img src="/icons/camping.svg" alt="Для подорожей" style={{width: '40px', height: '40px'}}/></span>
              <div>
                <h4>Для подорожей та кемпінгу</h4>
                <p>Енергія для автохолодильників, освітлення та гаджетів на природі, риболовлі чи в горах.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
