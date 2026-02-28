import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Aquí puedes ver todos los alumnos registrados.</p>

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
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{s.name}</h2>
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
