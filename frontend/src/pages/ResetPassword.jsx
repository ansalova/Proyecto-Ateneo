import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Token no encontrado. Usa el enlace de recuperación.");
    }
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) return;
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/reset-password", { token, password });
      setMessage(data.msg || "Contraseña restablecida.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error al restablecer contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
      <h2>Restablecer contraseña</h2>
      {!token ? (
        <p>Token inválido o faltante.</p>
      ) : (
        <form onSubmit={submit}>
          <label>Nueva contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />
          <label>Confirmar contraseña</label>
          <input
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      )}
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}

