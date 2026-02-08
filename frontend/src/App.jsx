// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";   // ← asegúrate de tener esta página
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import ConfirmacionPago from "./pages/ConfirmacionPago";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentGrades from "./pages/StudentGrades";
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

          {/* Dashboard protegido */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

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
