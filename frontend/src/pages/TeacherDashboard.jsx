import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { DollarSign } from "lucide-react";

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const s = await API.get("/api/teacher/students");
        setStudents(s.data);
      } catch (error) {
        console.error("Error cargando estudiantes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <p>Cargando estudiantes...</p>;

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>Panel de profesores</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Aquí puedes ver todos los alumnos registrados y gestionar los pagos.</p>

      {/* Card de Pagos */}
      <div 
        style={{
          backgroundColor: 'linear-gradient(135deg, #1f7a4a 0%, #16a34a 100%)',
          backgroundImage: 'linear-gradient(135deg, #1f7a4a 0%, #16a34a 100%)',
          borderRadius: 8,
          padding: '20px',
          marginBottom: '2rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Gestionar Pagos de Estudiantes</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Ver pagos pendientes y cambiar su estado</p>
          </div>
        </div>
        <Link to="/admin/pagos" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'white', color: '#1f7a4a', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Ver Pagos
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
        {students.map(s => (
          <div
            key={s.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Link
              to={`estudiantes/${s.id}`}
              style={{ textDecoration: 'none', color: '#0b63f6' }}
            >
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>
                {s.name} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(ID {s.id})</span>
              </h2>
            </Link>
            <p style={{ margin: '4px 0', color: '#475569' }}><strong>Email:</strong> {s.email}</p>
            <p style={{ margin: '4px 0', color: '#475569' }}>
              <strong>Rol:</strong>{' '}
              <span style={{ textTransform: 'capitalize', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: '0.875rem' }}>
                {s.role}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
