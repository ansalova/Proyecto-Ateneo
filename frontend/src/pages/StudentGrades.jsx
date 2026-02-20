import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const { data } = await API.get("/api/student/my-grades");
        setGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
        setError("No se pudieron cargar las calificaciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return <p>Cargando calificaciones...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (grades.length === 0) {
    return (
      <div className="container" style={{ padding: "20px" }}>
      <h1>Mis calificaciones</h1>
        <p>No tienes calificaciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>Mis Calificaciones</h1>
      <div className="table-responsive">
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "10px" }}>Materia</th>
              <th style={{ padding: "10px" }}>Periodo</th>
              <th style={{ padding: "10px" }}>Calificación</th>
              <th style={{ padding: "10px" }}>Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{g.subject}</td>
                <td style={{ padding: "10px" }}>{g.period}</td>
                <td style={{ padding: "10px", fontWeight: "bold", color: g.grade >= 3 ? "green" : "red" }}>
                  {g.grade}
                </td>
                <td style={{ padding: "10px" }}>{new Date(g.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
