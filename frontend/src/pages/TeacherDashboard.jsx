import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("students");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const s = await API.get("/api/teacher/students", { headers });
        const g = await API.get("/api/teacher/grades", { headers });
        // Fetch payments if user is admin/teacher. If this fails (e.g. 403), ignore gracefully or handle it.
        try {
          const p = await API.get("/api/payments/admin/orders", { headers });
          setPayments(p.data);
        } catch (err) {
          console.warn("No autorizado para ver pagos o error de red", err);
        }
        
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
          style={{ marginRight: "10px" }}
        >
          Calificaciones
        </button>
        <button 
          onClick={() => setTab("payments")} 
          className={tab === "payments" ? "button" : "button-outline"}
        >
          Pagos
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
                <tr key={s._id || s.id} style={{ borderBottom: "1px solid #eee" }}>
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

      {tab === "payments" && (
        <div className="table-responsive">
          <h3>Historial de Pagos Global</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>Fecha</th>
                <th>Referencia</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>{p.external_reference}</td>
                  <td>{p.user_name || 'N/A'}</td>
                  <td>{p.user_email || 'N/A'}</td>
                  <td>${Number(p.amount).toLocaleString()}</td>
                  <td>{p.method}</td>
                  <td>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px",
                      backgroundColor: p.status === 'approved' ? '#d4edda' : 
                                     p.status === 'pending' ? '#fff3cd' : '#f8d7da',
                      color: p.status === 'approved' ? '#155724' : 
                             p.status === 'pending' ? '#856404' : '#721c24'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
