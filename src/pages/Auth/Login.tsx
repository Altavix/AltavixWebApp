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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loginAction, isLoading] = useFetching<AuthResponseDto>(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Будь ласка, заповніть всі поля', 'info');
      return;
    }

    return await AuthService.login(email, password);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await loginAction(e);
    
    if (!result) return;
    
    if (result.messageType === 'success' && result.data) {
      login({ 
        id: result.data.userId || '1', 
        email: email, 
        name: email,
        role: result.data.role
      });
      showToast('Успішний вхід!', 'success');
      navigate('/');
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-container">
        <h2>Вхід</h2>
        <p className="auth-subtitle">Увійдіть у свій акаунт Altavix</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="Введіть ваш email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Пароль" 
            type="password" 
            placeholder="Введіть ваш пароль" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Увійти
          </Button>
        </form>

        <div className="auth-links">
          Немає акаунту? <Link to="/register" className="auth-link">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
