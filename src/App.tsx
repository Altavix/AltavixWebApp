import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import RegisterAdmin from './pages/Auth/RegisterAdmin'
import Catalog from './pages/Catalog/Catalog'
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
      </Routes>
      <Toast />
    </Layout>
  )
}

export default App

