import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import './styles/index.css'
import App from './App.tsx'

// Очищення старих багованих кукі з неправильним шляхом (з попередньої версії)
document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/Auth;";
document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/Auth;";
document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/Auth";
document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/Auth";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
