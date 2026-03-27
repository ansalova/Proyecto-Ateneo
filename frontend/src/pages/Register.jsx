import React, { useState, useContext } from "react";
import { AlertTriangle, Lock, Mail, IdCard, BookOpen, CheckCircle2, Eye, EyeOff, Phone, User, School, ShieldCheck, ChevronRight } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [documentType, setDocumentType] = useState("cedula_ciudadania");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [grade, setGrade] = useState("");
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validaciones simples en frontend
    if (!name.trim() || !email.trim() || !password) {
      setToast({ type: 'warning', message: (<><AlertTriangle size={14} className="inline mr-1" />Por favor completa todos los campos</>) });
      return;
    }
    if (password.length < 6) {
      setToast({ type: 'warning', message: (<><Lock size={14} className="inline mr-1" />La contraseña debe tener al menos 6 caracteres</>) });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToast({ type: 'warning', message: (<><Mail size={14} className="inline mr-1" />Ingresa un email válido (ej: usuario@ejemplo.com)</>) });
      return;
    }
    if (!documentNumber.trim()) {
      setToast({ type: 'warning', message: (<><IdCard size={14} className="inline mr-1" />Ingresa tu número de documento</>) });
      return;
    }
    if (role === "student" && !grade.trim()) {
      setToast({ type: 'warning', message: '📚 Selecciona tu grado/nivel' });
      return;
    }

    const r = await register({ name, email, password, role, documentType, documentNumber, phone, inviteCode, grade });
    if (!r.success) { 
      setToast({ type: 'error', message: r.message });
      return; 
    }
    
    setToast({ type: 'success', message: '✅ Registro exitoso. Verifica tu email.' });
    // indicar al login que se registró para mostrar aviso de verificar email
    setTimeout(() => nav("/login?registered=1"), 1500);
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: '#f0fdf4', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#1f7a4a' }}>
            <School size={32} />
          </div>
          <h2 style={{ fontSize: '28px', color: '#1e293b', margin: '0 0 8px 0' }}>Crea tu cuenta</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Únete a la comunidad educativa Ateneo</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sección: Datos de Usuario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Juan Pérez" required style={{ paddingLeft: '40px', width: '100%' }} />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="usuario@ejemplo.com" required style={{ paddingLeft: '40px', width: '100%' }} />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  className="input"
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  required 
                  style={{ paddingLeft: '40px', paddingRight: '45px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '10px 0' }} />

          {/* Sección: Identificación y Contacto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Tipo de Documento</label>
              <select className="input" value={documentType} onChange={e=>setDocumentType(e.target.value)} style={{ width: '100%' }}>
                <option value="cedula_ciudadania">Cédula de Ciudadanía</option>
                <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                <option value="cedula_extranjeria">Cédula de Extranjería</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Número</label>
              <input className="input" type="text" value={documentNumber} onChange={e=>setDocumentNumber(e.target.value)} placeholder="12345..." required style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Teléfono</label>
              <input className="input" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="310..." style={{ width: '100%' }} />
            </div>
          </div>

          {/* Sección: Perfil Académico */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>¿Quién eres?</label>
              <select className="input" value={role} onChange={e=>setRole(e.target.value)} style={{ width: '100%' }}>
                <option value="student">Estudiante</option>
                <option value="teacher">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {role === "student" && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Grado / Nivel</label>
                <select className="input" value={grade} onChange={e=>setGrade(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Selecciona tu grado</option>
                  <option value="6-7">Ciclo III (6° - 7°)</option>
                  <option value="8-9">Ciclo IV (8° - 9°)</option>
                  <option value="10-11">Ciclo V-VI (10° - 11°)</option>
                </select>
              </div>
            )}

            {(role === "teacher" || role === "admin") && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Código de Invitación</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    className="input"
                    type="password"
                    value={inviteCode}
                    onChange={e=>setInviteCode(e.target.value)}
                    placeholder="Clave de acceso"
                    style={{ paddingLeft: '40px', width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            className="button" 
            type="submit" 
            style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px' }}
          >
            Crear Cuenta <ChevronRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
          ¿Ya tienes una cuenta? <span onClick={() => nav('/login')} style={{ color: '#1f7a4a', fontWeight: 'bold', cursor: 'pointer' }}>Inicia sesión aquí</span>
        </div>
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
