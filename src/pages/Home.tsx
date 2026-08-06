import React from 'react';
import Button from '../components/UI/Button';
import '../styles/pages/Home.css';

const Home: React.FC = () => {
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
            <Button variant="secondary">ПЕРЕГЛЯНУТИ КАТАЛОГ</Button>
          </div>
          <div className="hero-image-placeholder">
            {/* 
              IMAGE PLACEHOLDER: 
              Please provide an image of a modern charging station (like EcoFlow or Jackery)
              or a happy family using portable power, preferably with a dark or transparent background.
            */}
            <span>[Місце для зображення зарядної станції (EcoFlow/Jackery)]</span>
          </div>
        </div>
      </section>

      {/* ABOUT COMPANY CARDS */}
      <section className="about-section container">
        <h2 className="section-title">ЧОМУ ОБИРАЮТЬ ALTAVIX</h2>
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-image-placeholder">
              <span>[Іконка або фото: Широкий вибір]</span>
            </div>
            <h3>Широкий асортимент</h3>
            <p>Ми пропонуємо оригінальні портативні електростанції від провідних виробників: EcoFlow, Jackery, Bluetti та інших.</p>
            <Button variant="primary">Каталог</Button>
          </div>
          
          <div className="info-card">
            <div className="card-image-placeholder">
              <span>[Іконка або фото: Оригінальність]</span>
            </div>
            <h3>Сертифікований товар</h3>
            <p>Тільки офіційна та перевірена продукція. Ми гарантуємо 100% оригінальність кожного пристрою, який ви купуєте.</p>
            <Button variant="primary">Документи</Button>
          </div>

          <div className="info-card">
            <div className="card-image-placeholder">
              <span>[Іконка або фото: Ціни]</span>
            </div>
            <h3>Конкурентні ціни</h3>
            <p>Пряма співпраця з дистриб'юторами дозволяє нам пропонувати найкращі ціни на ринку та регулярні акційні пропозиції.</p>
            <Button variant="primary">Акції</Button>
          </div>

          <div className="info-card">
            <div className="card-image-placeholder">
              <span>[Іконка або фото: Склад]</span>
            </div>
            <h3>Власний склад</h3>
            <p>Всі товари знаходяться на нашому складі в Україні, що гарантує максимально швидке відвантаження ваших замовлень.</p>
            <Button variant="primary">Детальніше</Button>
          </div>
        </div>
      </section>

      {/* USE CASES SECTION (Replacing Advantages) */}
      <section className="advantages-section">
        <div className="container">
          <h2 className="section-title">ДЛЯ ЧОГО ВАМ ПОТРІБНА СТАНЦІЯ</h2>
          <div className="advantages-grid">
            <div className="advantage-item">
              <span className="adv-icon">🏠</span>
              <div>
                <h4>Для дому та квартири</h4>
                <p>Живлення газового котла, холодильника, роутера та освітлення під час тривалих відключень.</p>
              </div>
            </div>
            <div className="advantage-item">
              <span className="adv-icon">💻</span>
              <div>
                <h4>Для роботи та бізнесу</h4>
                <p>Безперебійна робота комп'ютерів, касових апаратів, терміналів та зарядка телефонів команди.</p>
              </div>
            </div>
            <div className="advantage-item">
              <span className="adv-icon">🏕️</span>
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
