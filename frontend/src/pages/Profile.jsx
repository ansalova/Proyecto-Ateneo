import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { showToast } from "../utils/helpers";

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    documentType: "cedula_ciudadania",
    documentNumber: "",
    grade: "",
    password: ""
  });
  const [verified, setVerified] = useState(true);
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await API.get('/api/auth/profile');
        const u = data.user;
        setVerified(u.verified);
        setForm({
          name: u.name || "",
          email: u.email || "",
          documentType: u.document_type || "cedula_ciudadania",
          documentNumber: u.document_number || "",
          grade: u.grade || "",
          password: ""
        });
      } catch (err) {
        console.error('Error loading profile', err);
        setError('No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const updates = {
      name: form.name,
      email: form.email,
      document_type: form.documentType,
      document_number: form.documentNumber,
      grade: form.grade
    };
    if (form.password) updates.password = form.password;

    const res = await updateProfile(updates);
    if (res.success) {
      showToast('Perfil actualizado', { type: 'success' });
      setForm(prev => ({ ...prev, password: '' }));
      if (res.user && res.user.verified !== undefined) {
        setVerified(res.user.verified);
      }
    } else {
      setError(res.message || 'Error actualizando perfil');
    }
  };

  if (loading) return <div className="container"><p>Cargando perfil...</p></div>;

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h2>Mi Perfil</h2>
      {error && <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', marginBottom: 12, padding: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input className="input" name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Tipo de documento</label>
        <select className="input" name="documentType" value={form.documentType} onChange={handleChange}>
          <option value="cedula_ciudadania">Cédula de Ciudadanía</option>
          <option value="tarjeta_identidad">Tarjeta de Identidad</option>
          <option value="cedula_extranjeria">Cédula de Extranjería</option>
        </select>

        <label>Número de documento</label>
        <input className="input" name="documentNumber" value={form.documentNumber} onChange={handleChange} />

        {user && user.role === 'student' && (
          <>
            <label>Grado</label>
            <select className="input" name="grade" value={form.grade} onChange={handleChange}>
              <option value="">Selecciona tu grado</option>
              <option value="6-7">6° - 7°</option>
              <option value="8-9">8° - 9°</option>
              <option value="10-11">10° - 11°</option>
            </select>
          </>
        )}

        <label>Nueva contraseña (dejar en blanco para conservar la actual)</label>
        <input className="input" type="password" name="password" value={form.password} onChange={handleChange} />

        <button className="button" type="submit" style={{ marginTop: '12px' }}>Guardar cambios</button>
      </form>
    </div>
  );
}
