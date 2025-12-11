import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingBtn(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setErrorMsg(result.message);
        setLoadingBtn(false);
        return;
      }

      nav('/dashboard');
    } catch (error) {
      setErrorMsg("Error inesperado en el inicio de sesión");
    }

    setLoadingBtn(false);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>Iniciar sesión</h2>

      {errorMsg && (
        <p style={{ color: "red", fontWeight: "bold" }}>{errorMsg}</p>
      )}

      <form onSubmit={submit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
          type="email"
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
          required
        />

        <button className="button" type="submit" disabled={loadingBtn}>
          {loadingBtn ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

