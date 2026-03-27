import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { showToast } from "../utils/helpers";
import { Eye, EyeOff, Lock, User, Save, Phone } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    documentType: "cedula_ciudadania",
    documentNumber: "",
    phone: "",
    grade: "",
    password: "",
    confirmPassword: ""
  });
  const [verified, setVerified] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
          phone: u.phone || "",
          grade: u.grade || "",
          password: "",
          confirmPassword: ""
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

    if (form.password && form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const updates = {
      name: form.name,
      email: form.email,
      document_type: form.documentType,
      document_number: form.documentNumber,
      phone: form.phone,
      grade: form.grade
    };
    if (form.password) updates.password = form.password;

    const res = await updateProfile(updates);
    if (res.success) {
      showToast('Perfil actualizado', { type: 'success' });
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      if (res.user && res.user.verified !== undefined) {
        setVerified(res.user.verified);
      }
    } else {
      setError(res.message || 'Error actualizando perfil');
    }
  };

  if (loading) return <div className="container"><p>Cargando perfil...</p></div>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: '#1f7a4a', padding: '10px', borderRadius: '12px', color: 'white' }}>
            <User size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Mi Perfil</h1>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Nombre completo</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Tipo de documento</label>
              <select className="input" name="documentType" value={form.documentType} onChange={handleChange} style={{ width: '100%' }}>
                <option value="cedula_ciudadania">Cédula de Ciudadanía</option>
                <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                <option value="cedula_extranjeria">Cédula de Extranjería</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Número de documento</label>
              <input className="input" name="documentNumber" value={form.documentNumber} onChange={handleChange} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Teléfono</label>
              <input className="input" name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%' }} />
            </div>
          </div>

          {user && user.role === 'student' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Grado</label>
              <select className="input" name="grade" value={form.grade} onChange={handleChange} style={{ width: '100%' }}>
                <option value="">Selecciona tu grado</option>
                <option value="6-7">6° - 7°</option>
                <option value="8-9">8° - 9°</option>
                <option value="10-11">10° - 11°</option>
              </select>
            </div>
          )}

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '10px 0', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#1f7a4a' }} /> Seguridad
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="input" 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="Dejar en blanco para no cambiar"
                    style={{ width: '100%', paddingRight: '40px' }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Confirmar contraseña</label>
                <input 
                  className="input" 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  style={{ width: '100%' }} 
                />
              </div>
            </div>
            <small style={{ color: '#64748b', marginTop: '8px', display: 'block' }}>Si no deseas cambiar tu contraseña, deja estos campos vacíos.</small>
          </div>

          <button 
            className="button" 
            type="submit" 
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
          >
            <Save size={18} /> Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}
