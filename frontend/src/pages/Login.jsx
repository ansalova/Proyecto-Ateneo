import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const result = await login({ email, password });

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    nav("/");
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Iniciar sesión</h2>

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
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

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
    </div>
  );
}

