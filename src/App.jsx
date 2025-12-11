import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

// 🔵 Importaciones necesarias para la parte de pagos
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import ConfirmacionPago from "./pages/ConfirmacionPago";


export default function App() {
  return (
    <div>
      <header className="header">
        <div className="container nav">
          <Header />
        </div>
      </header>

      <main className="container" style={{ paddingTop: 20 }}>
        <Routes>
          {/* Rutas existentes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* 🔵 Ruta protegida de checkout (tuya) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* 🔵 Ruta protegida del dashboard (tuya) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 🟦 NUEVAS RUTAS DEL SISTEMA DE PAGO (simulado) */}
          <Route path="/pago" element={<PaymentMethodsPage />} />
          <Route path="/confirmacion-pago" element={<ConfirmacionPago />} />

          {/* Ruta para errores */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
