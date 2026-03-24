import React, { useState, useContext } from "react";
import { CheckCircle2, XCircle, AlertTriangle, User2, Mail, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified');
  const justRegistered = searchParams.get('registered');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setToast(null);

    // Validar que los campos no estén vacíos
    if (!email.trim() || !password.trim()) {
      setToast({ type: 'warning', message: (<><AlertTriangle size={14} className="inline mr-1" />Por favor ingresa tu email y contraseña</>) });
      return;
    }

    const result = await login({ email, password });

    if (!result.success) {
      // Mensajes más amigables según el error
      let friendlyMsg = result.message;
      if (result.message.includes('credenciales')) {
        friendlyMsg = (<><XCircle size={14} className="inline mr-1" />Email o contraseña incorrectos. Intenta nuevamente.</>);
      } else if (result.message.includes('no existe')) {
        friendlyMsg = (<><User2 size={14} className="inline mr-1" />Esta cuenta no existe. ¿Quieres crear una?</>);
      } else if (result.message.includes('sesión')) {
        friendlyMsg = (<><AlertTriangle size={14} className="inline mr-1" />Se acabó tu sesión. Por favor inicia sesión de nuevo.</>);
      }
      
      setToast({ type: 'error', message: friendlyMsg });
      setErrorMsg(friendlyMsg);
      return;
    }

    setToast({ type: 'success', message: (<><CheckCircle2 size={14} className="inline mr-1" />¡Bienvenido!</>) });
    setTimeout(() => nav("/"), 800);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Iniciar sesión</h2>

      {justRegistered && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Registro exitoso. Bienvenido.
        </p>
      )}
      {errorMsg && (
        <p style={{ color: "red", fontWeight: "bold" }}>{errorMsg}</p>
      )}

      <form onSubmit={submit}>
        <label>Email</label>
        <input
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <label>Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            value={password}
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: '8px 40px 8px 8px', 
              marginBottom: 8,
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              opacity: 0.6
            }}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="button" type="submit">Entrar</button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Link
          to="/forgot-password"
          style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 8 }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <p style={{ margin: '12px 0 0 0', fontSize: 14 }}>
          ¿No tienes cuenta? 
          <Link
            to="/register"
            style={{ color: '#2563eb', textDecoration: 'none', marginLeft: 6 }}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

