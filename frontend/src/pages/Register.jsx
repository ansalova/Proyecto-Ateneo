import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    const r = await register({ name, email, password, role });
    if (!r.success) { setMsg(r.message); return; }
    nav("/login");
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
        
        <label>Rol</label>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="student">Estudiante</option>
          <option value="teacher">Profesor</option>
          <option value="admin">Administrador</option>
        </select>

        <button className="button" type="submit">Registrar</button>
      </form>
    </div>
  );
}
