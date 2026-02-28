import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        // Limpiar caché del navegador antes de cargar
        try {
          if (window.caches) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
        } catch (e) {
          console.log('No hay service worker caché');
        }
        
        const { data } = await API.get(`/api/student/my-grades?t=${Date.now()}`);
        console.log("grades response", data);
        if (!Array.isArray(data)) {
          throw new Error("Formato inválido de calificaciones");
        }
        setGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
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

  if (loading)
    return (
      <div className="container" style={{ padding: "20px", textAlign: 'center' }}>
        <p>Cargando calificaciones...</p>
      </div>
    );
  if (error)
    return (
      <div className="container" style={{ padding: "20px", textAlign: 'center' }}>
        <p style={{ color: "red", fontWeight: 'bold' }}>{error}</p>
      </div>
    );

  if (grades.length === 0 && !error) {
    // sólo mostramos el mensaje vacío si no hubo error (evitamos sobrescribir
    // el texto de error cuando la API devuelve una lista vacía)
    return (
      <div className="container" style={{ padding: "20px", textAlign: 'center' }}>
        <h1>Mis calificaciones</h1>
        <div className="card">
          <p>No tienes calificaciones registradas aún.</p>
        </div>
      </div>
    );
  }

  // compute average, ignoring null/undefined grades
  const validGrades = grades.filter(g => typeof g.grade === 'number');
  const avg = validGrades.length
    ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length
    : 0;

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Boletín de Calificaciones</h1>
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", fontFamily: 'sans-serif' }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "3px solid #444", backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "12px 8px" }}>Materia</th>
              <th style={{ padding: "12px 8px" }}>Periodo</th>
              <th style={{ padding: "12px 8px" }}>Calificación</th>
              <th style={{ padding: "12px 8px" }}>Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                <td style={{ padding: "10px 8px", verticalAlign: 'middle' }}>{g.subject}</td>
                <td style={{ padding: "10px 8px", verticalAlign: 'middle' }}>{g.period}</td>
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
            <tr>
              <td colSpan={2} style={{ padding: "12px 8px", fontWeight: '700', borderTop: '2px solid #ccc' }}>
                Promedio general
              </td>
              <td style={{ padding: "12px 8px", fontWeight: '700', color: avg >= 3 ? '#10b981' : '#ef4444', borderTop: '2px solid #ccc' }}>
                {avg.toFixed(2)}
              </td>
              <td style={{ borderTop: '2px solid #ccc' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
