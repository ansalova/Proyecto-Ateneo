// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherRoute from "./components/TeacherRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const ConfirmacionPago = lazy(() => import("./pages/ConfirmacionPago"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));

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
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/carrito" element={<Carrito />} />
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route element={<TeacherRoute />}>
              <Route path="/profesor" element={<TeacherDashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* FOOTER */}
      <Footer />
      
      <CartDrawer />
    </div>
  );
}
