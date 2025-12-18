import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("students");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await API.get("/api/teacher/students");
        const g = await API.get("/api/teacher/grades");
        setStudents(s.data);
        setGrades(g.data);
      } catch (error) {
        console.error("Error fetching teacher data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>Panel de Profesor / Admin</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={() => setTab("students")} 
          className={tab === "students" ? "button" : "button-outline"}
          style={{ marginRight: "10px" }}
        >
          Estudiantes
        </button>
        <button 
          onClick={() => setTab("grades")} 
          className={tab === "grades" ? "button" : "button-outline"}
        >
          Calificaciones
        </button>
      </div>

      {tab === "students" && (
        <div className="table-responsive">
          <h3>Lista de Estudiantes</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "grades" && (
        <div className="table-responsive">
          <h3>Calificaciones</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>ID Estudiante</th>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{g.studentId}</td>
                  <td>{g.name}</td>
                  <td>{g.subject}</td>
                  <td>{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
