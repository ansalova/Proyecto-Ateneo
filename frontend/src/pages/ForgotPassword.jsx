import React, { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResetLink("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/forgot-password", { email });
      setMessage(data.msg || "Si el correo existe, se enviará un enlace.");
      if (data.resetLink) setResetLink(data.resetLink);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error al generar enlace de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
      <h2>Recuperar contraseña</h2>
      <p>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
      <form onSubmit={submit}>
        <label>Correo electrónico</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
      {resetLink && (
        <div style={{ marginTop: 12 }}>
          <p>Enlace de restablecimiento:</p>
          <a href={resetLink}>{resetLink}</a>
        </div>
      )}
    </div>
  );
}

