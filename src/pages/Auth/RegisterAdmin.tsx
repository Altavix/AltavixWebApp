import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useFetching } from '../../hooks/useFetching';
import { useToast } from '../../hooks/useToast';
import AuthService from '../../services/AuthService';
import '../../styles/pages/Auth.css';

const RegisterAdmin: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [registerAdminAction, isLoading] = useFetching(async () => {
    const payload = {
      firstName: name,
      lastName: surname,
      middleName: middleName,
      phoneNumber: phone,
      email,
      password,
      confirmPassword,
      secretKey
    };

    return await AuthService.registerAdmin(payload);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !secretKey) {
      showToast('Будь ласка, заповніть всі обов\'язкові поля', 'info');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Паролі не співпадають', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/;
    if (!passwordRegex.test(password)) {
      showToast('Пароль повинен містити мінімум 6 символів, велику та малу літери, цифру та спеціальний символ (!@#$%^&*)', 'error');
      return;
    }

    const result = await registerAdminAction();
    
    if (!result) return;
    
    if (result.messageType === 'success') {
      showToast('Адміністратор успішно створений!', 'success');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <h2 style={{ color: 'var(--color-primary-dark)' }}>Реєстрація Адміністратора</h2>
        <p className="auth-subtitle">Створення нового облікового запису з правами доступу</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Прізвище" 
              type="text" 
              placeholder="Введіть прізвище" 
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
              placeholder="Введіть по-батькові" 
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
              label="Підтвердження паролю *" 
              type="password" 
              placeholder="Повторіть пароль" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.05)', borderRadius: '8px', border: '1px dashed red' }}>
            <Input 
              label="Секретний Ключ (Secret Key) *" 
              type="password" 
              placeholder="Введіть ключ для реєстрації адміна" 
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" variant="primary" isLoading={isLoading} style={{ marginTop: '1.5rem' }}>
            Зареєструвати Адміністратора
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
