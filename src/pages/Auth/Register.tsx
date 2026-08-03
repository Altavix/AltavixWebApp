import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { AuthResponseDto } from '../../types/auth';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';
import { useFetching } from '../../hooks/useFetching';
import { useToast } from '../../hooks/useToast';
import AuthService from '../../services/AuthService';
import '../../styles/pages/Auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [registerAction, isLoading] = useFetching(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      showToast('Будь ласка, заповніть всі обов\'язкові поля', 'info');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Паролі не співпадають', 'error');
      return;
    }

    return await AuthService.register(name, email, password, surname, middleName, phone);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await registerAction(e);
    
    if (!result) return;
    
    if (result.messageType === 'success') {
      showToast('Реєстрація успішна! Тепер ви можете увійти', 'success');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <h2>Реєстрація</h2>
        <p className="auth-subtitle">Створіть новий акаунт Altavix</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Прізвище" 
              type="text" 
              placeholder="Ваше прізвище" 
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            <Input 
              label="Ім'я *" 
              type="text" 
              placeholder="Як до вас звертатися?" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input 
              label="По-батькові" 
              type="text" 
              placeholder="Ваше по-батькові" 
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <Input 
              label="Номер телефону" 
              type="tel" 
              placeholder="+380..." 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input 
            label="Email *" 
            type="email" 
            placeholder="Введіть ваш email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Пароль *" 
              type="password" 
              placeholder="Придумайте пароль" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input 
              label="Повторення паролю *" 
              type="password" 
              placeholder="Повторіть пароль" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Зареєструватися
          </Button>
        </form>

        <div className="auth-links">
          Вже є акаунт? <Link to="/login" className="auth-link">Увійти</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
