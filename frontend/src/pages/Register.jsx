import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [documentType, setDocumentType] = useState("cedula_ciudadania");
  const [documentNumber, setDocumentNumber] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [grade, setGrade] = useState("");
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validaciones simples en frontend
    if (!name.trim() || !email.trim() || !password) {
      setToast({ type: 'warning', message: '📝 Por favor completa todos los campos' });
      return;
    }
    if (password.length < 6) {
      setToast({ type: 'warning', message: '🔑 La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToast({ type: 'warning', message: '✉️ Ingresa un email válido (ej: usuario@ejemplo.com)' });
      return;
    }
    if (!documentNumber.trim()) {
      setToast({ type: 'warning', message: '🆔 Ingresa tu número de documento' });
      return;
    }
    if (role === "student" && !grade.trim()) {
      setToast({ type: 'warning', message: '📚 Selecciona tu grado/nivel' });
      return;
    }

    const r = await register({ name, email, password, role, documentType, documentNumber, inviteCode, grade });
    if (!r.success) { 
      setToast({ type: 'error', message: r.message });
      return; 
    }
    
    setToast({ type: 'success', message: '✅ Registro exitoso. Verifica tu email.' });
    // indicar al login que se registró para mostrar aviso de verificar email
    setTimeout(() => nav("/login?registered=1"), 1500);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Registrar</h2>
      {msg && <p style={{color:"red"}}>{msg}</p>}
      <form onSubmit={submit}>
        <label>Nombre</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        <label>Tipo de Documento</label>
        <select value={documentType} onChange={e=>setDocumentType(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="cedula_ciudadania">Cédula de Ciudadanía</option>
          <option value="tarjeta_identidad">Tarjeta de Identidad</option>
          <option value="cedula_extranjeria">Cédula de Extranjería</option>
        </select>

        <label>Número de Documento</label>
        <input 
          type="text" 
          value={documentNumber} 
          onChange={e=>setDocumentNumber(e.target.value)} 
          placeholder="Ingresa tu número de documento"
          required 
        />

        <label>Rol</label>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="student">Estudiante</option>
          <option value="teacher">Profesor</option>
          <option value="admin">Administrador</option>
        </select>

        {role === "student" && (
          <>
            <label>Grado</label>
            <select value={grade} onChange={e=>setGrade(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
              <option value="">Selecciona tu grado</option>
              <option value="6-7">6° - 7°</option>
              <option value="8-9">8° - 9°</option>
              <option value="10-11">10° - 11°</option>
            </select>
          </>
        )}

        {(role === "teacher" || role === "admin") && (
          <>
            <label>Clave única</label>
            <input
              value={inviteCode}
              onChange={e=>setInviteCode(e.target.value)}
              placeholder="Ingresa la clave única"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </>
        )}

        <button className="button" type="submit">Registrar</button>
      </form>

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
