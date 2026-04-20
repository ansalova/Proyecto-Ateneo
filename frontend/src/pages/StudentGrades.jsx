import React, { useEffect, useState } from "react";
import { RotateCcw, GraduationCap, Mail, User } from 'lucide-react';
import API from "../services/api";
import logger from "../utils/logger";

const SUBJECTS_ORDER = ["Matemáticas", "Español", "Ciencias", "Historia", "Inglés", "Arte", "Educación Física", "Tecnología"];

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        // Limpiar completamente caché y storage
        if (window.caches) {
          try {
            const cacheNames = await window.caches.keys();
            await Promise.all(cacheNames.map(name => window.caches.delete(name)));
            logger.debug('✅ Service worker cache limpiado');
          } catch (e) {
            logger.info('ℹ️ No hay service worker caché');
          }
        }
        
        // Forzar recarga sin caché con timestamp
        const timestamp = new Date().getTime();
        const url = `student/my-grades?t=${timestamp}`;
        logger.info('📡 Petición a:', url);
        
        const response = await API.get(url);
        const data = response.data;
        logger.debug("📦 Respuesta recibida:", data);
        
        if (!data || !Array.isArray(data.grades)) {
          throw new Error("Formato inválido de calificaciones");
        }
        setStudent({ name: data.name, email: data.email });
        const gradesArray = data.grades;

        // Asegurar que la calificación sea un número
        const gradesWithNumbers = gradesArray.map(g => ({
          ...g,
          grade: g.grade !== null ? parseFloat(g.grade) : null
        }));

        // Ordenar por el orden de SUBJECTS definido
        const sortedGrades = [...gradesWithNumbers].sort((a, b) => {
          let idxA = SUBJECTS_ORDER.indexOf(a.subject);
          let idxB = SUBJECTS_ORDER.indexOf(b.subject);
          // Si la materia no está en la lista, ponerla al final
          if (idxA === -1) idxA = 99;
          if (idxB === -1) idxB = 99;
          return idxA - idxB;
        });
        console.log(sortedGrades);
        setGrades(sortedGrades);
      } catch (err) {
        logger.error("Error fetching grades:", err);
        // Construir mensaje con prioridad, y detectar fallos de conexión
        let msg = err.response?.data?.msg || err.message || "No se pudieron cargar las calificaciones.";
        if (err.code === 'ECONNREFUSED' || msg.toLowerCase().includes('network error')) {
          msg = `No se pudo conectar con el servidor (${API.defaults.baseURL}). Asegúrate de que el backend esté en ejecución.`;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const manualRefresh = async () => {
    logger.info('🔄 Limpieza manual iniciada...');
    try {
      // Solo limpiamos el caché de red y service workers, manteniendo la sesión (localStorage)
      // Limpiar service worker cache
      if (window.caches) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map(name => window.caches.delete(name)));
        logger.debug('✅ Service worker cache limpiado');
      }
      
      // Esperar un momento y recargar
      setTimeout(() => {
        logger.info('🔄 Recargando página...');
        window.location.reload();
      }, 500);
    } catch (e) {
      logger.error('Error durante limpieza:', e);
      window.location.reload();
    }
  };
  if (error) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: 'center' }}>
        <p style={{ color: "red", fontWeight: 'bold' }}>{error}</p>
        <button onClick={manualRefresh} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          <RotateCcw size={16} className="inline mr-2" /> Limpiar caché e intentar de nuevo
        </button>
      </div>
    );
  }

  if (loading || (grades.length === 0 && !error)) {
    // sólo mostramos el mensaje vacío si no hubo error (evitamos sobrescribir
    // el texto de error cuando la API devuelve una lista vacía)
    return (
      <div className="container" style={{ padding: "20px", textAlign: 'center' }}>
        <h1>Mis calificaciones</h1>
        <div className="card">
          <p>{loading ? "Cargando calificaciones..." : "No tienes calificaciones registradas aún."}</p>
          {!loading && (
            <button onClick={manualRefresh} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <RotateCcw size={16} className="inline mr-2" /> Limpiar caché e intentar de nuevo
            </button>
          )}
        </div>
      </div>
    );
  }

  // compute average, ignoring null/undefined grades
  const validGrades = grades.filter(g => typeof g.grade === 'number' && !isNaN(g.grade));
  const avg = validGrades.length
    ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length
    : 0;

  // Group grades by period
  const gradesByPeriod = {};
  grades.forEach(g => {
    if (!gradesByPeriod[g.period]) {
      gradesByPeriod[g.period] = [];
    }
    gradesByPeriod[g.period].push(g);
  });

  // Sort periods numerically
  const sortedPeriods = Object.keys(gradesByPeriod).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  });

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <GraduationCap size={40} style={{ color: '#1f7a4a' }} />
          <h1 style={{ margin: 0 }}>Boletín de Calificaciones</h1>
        </div>
        
        {student && (
          <div className="card" style={{ display: 'inline-block', padding: '10px 20px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <User size={16} /> <strong>{student.name}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.9rem', color: '#64748b' }}>
              <Mail size={14} /> {student.email}
            </div>
          </div>
        )}
      </div>
      
      {/* Display each period */}
      {sortedPeriods.map((period) => {
        const periodGrades = gradesByPeriod[period];
        const periodValidGrades = periodGrades.filter(g => typeof g.grade === 'number' && !isNaN(g.grade));
        const periodAvg = periodValidGrades.length
          ? periodValidGrades.reduce((sum, g) => sum + g.grade, 0) / periodValidGrades.length
          : 0;

        return (
          <div key={period} style={{ marginBottom: "30px" }}>
            <div
              style={{
                backgroundColor: "#1f7a4a",
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px 8px 0 0",
                fontWeight: "700",
                fontSize: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>{period}</span>
              <span style={{ fontSize: "16px" }}>
                Promedio: <strong>{periodAvg.toFixed(2)}</strong>
              </span>
            </div>
            
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: 'sans-serif',
                  borderLeft: "3px solid #1f7a4a",
                  borderRight: "3px solid #1f7a4a",
                  borderBottom: "3px solid #1f7a4a"
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb", backgroundColor: "#f3f4f6" }}>
                    <th style={{ padding: "12px 8px" }}>Materia</th>
                    <th style={{ padding: "12px 8px" }}>Calificación</th>
                    <th style={{ padding: "12px 8px" }}>Última actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {periodGrades.map((g, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        borderBottom: "1px solid #e5e7eb"
                      }}
                    >
                      <td style={{ padding: "10px 8px", verticalAlign: 'middle' }}>{g.subject}</td>
                      <td
                        style={{
                          padding: "10px 8px",
                          fontWeight: "700",
                          color: typeof g.grade === 'number' && g.grade >= 3 ? "#10b981" : "#ef4444",
                          verticalAlign: 'middle'
                        }}
                      >
                        {typeof g.grade === 'number' ? g.grade.toFixed(2) : '-'}
                      </td>
                      <td style={{ padding: "10px 8px", verticalAlign: 'middle' }}>
                        {g.updated_at ? new Date(g.updated_at).toLocaleDateString('es-ES') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Overall average */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f0fdf4",
          border: "2px solid #1f7a4a",
          borderRadius: "8px",
          textAlign: "center"
        }}
      >
        <h2 style={{ color: "#1f7a4a", marginBottom: "10px" }}>Promedio General</h2>
        <p
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: avg >= 3 ? "#10b981" : "#ef4444"
          }}
        >
          {avg.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
