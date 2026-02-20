// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";   // ← asegúrate de tener esta página
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import ConfirmacionPago from "./pages/ConfirmacionPago";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentGrades from "./pages/StudentGrades";
import Anuncios from "./pages/Anuncios";
import Documentos from "./pages/Documentos";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentReport from "./pages/PaymentReport";
import Messaging from "./pages/Messaging";
import ContactForm from "./pages/ContactForm";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherRoute from "./components/TeacherRoute";

export default function App() {
  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="container nav">
          <Header />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container" style={{ paddingTop: 20 }}>
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<Home />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Carrito */}
          <Route path="/carrito" element={<Carrito />} />

          <Route
            path="/mis-notas"
            element={
              <ProtectedRoute>
                <StudentGrades />
              </ProtectedRoute>
            }
          />

          {/* Checkout protegido */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pago"
            element={
              <ProtectedRoute>
                <PaymentMethodsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/confirmacion-pago"
            element={
              <ProtectedRoute>
                <ConfirmacionPago />
              </ProtectedRoute>
            }
          />

          {/* Anuncios */}
          <Route
            path="/anuncios"
            element={
              <ProtectedRoute>
                <Anuncios />
              </ProtectedRoute>
            }
          />

          {/* Documentos */}
          <Route
            path="/documentos"
            element={
              <ProtectedRoute>
                <Documentos />
              </ProtectedRoute>
            }
          />

          {/* Dashboard protegido */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Reporte de Pagos */}
          <Route
            path="/admin/pagos"
            element={
              <ProtectedRoute>
                <PaymentReport />
              </ProtectedRoute>
            }
          />

          {/* Mensajes */}
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            }
          />

          {/* Contacto */}
          <Route path="/contacto" element={<ContactForm />} />

          {/* Panel Profesor */}
          <Route path="/profesor" element={<TeacherRoute />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="estudiantes/:id" element={<StudentProfile />} />
          </Route>

          {/* Cualquier ruta incorrecta → redirige al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />
      
      <CartDrawer />
    </div>
  );
}
