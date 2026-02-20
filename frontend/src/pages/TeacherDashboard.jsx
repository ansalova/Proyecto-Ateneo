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
      
      <div className="table-responsive">
        <h3>Lista de estudiantes</h3>
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
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>
                  <Link to={`estudiantes/${s.id}`} style={{ textDecoration: "none", color: "#0b63f6", fontWeight: 700 }}>
                    {s.name}
                  </Link>
                </td>
                <td>{s.email}</td>
                <td>{s.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
