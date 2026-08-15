import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import RegisterAdmin from './pages/Auth/RegisterAdmin'
import Catalog from './pages/Catalog/Catalog'
import ProductPage from './pages/Product/ProductPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import ProfilePage from './pages/Profile/ProfilePage'
import OrdersListPage from './pages/Profile/OrdersListPage'
import Toast from './components/UI/Toast'
import './styles/index.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-orders" element={<OrdersListPage />} />
      </Routes>
      <Toast />
    </Layout>
  )
}

export default App
