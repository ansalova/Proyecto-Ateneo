import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import API from "../services/api";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [edited, setEdited] = useState({});
  const [editModes, setEditModes] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const { data, status } = await API.get(`/api/teacher/students/${id}/grades?t=${Date.now()}`, {
          headers: { "Cache-Control": "no-cache" }
        });
        if (status !== 200 || !data || !data.student) {
          throw new Error("incomplete_response");
        }
        setStudent(data.student);
        setGrades(Array.isArray(data.grades) ? data.grades : []);
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        setPeriods(Array.isArray(data.periods) ? data.periods : []);
        const initialPeriod = (data.periods || [])[0] || "";
        setSelectedPeriod(initialPeriod);
      } catch (e) {
        setError("No fue posible cargar el perfil del estudiante");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isReady = !!student && Array.isArray(subjects) && Array.isArray(periods);

  const gradeMap = new Map();
  for (const g of grades) {
    if (g.grade !== null && g.grade !== undefined) {
      gradeMap.set(`${g.subject}::${g.period}`, Number(g.grade));
    }
  }

  useEffect(() => {
    const nextEdited = {};
    const nextEditModes = {};
    for (const s of subjects) {
      const current = gradeMap.get(`${s}::${selectedPeriod}`);
      // Al convertir a Number en el map, nos aseguramos que hasGrade funcione correctamente
      const hasGrade = typeof current === "number";
      nextEdited[s] = hasGrade ? current.toFixed(1) : "";
      // Si tenemos nota, el modo edición debe estar apagado (false)
      // Si NO tenemos nota, el modo edición debe estar encendido (true) para mostrar el input
      nextEditModes[s] = !hasGrade;
    }
    setEdited(nextEdited);
    setEditModes(nextEditModes);
  }, [selectedPeriod, subjects, grades]);

  const saveOne = async (subject) => {
    const raw = edited[subject];
    const val = Number(raw);
    if (Number.isNaN(val) || val < 0 || val > 5) {
      setMessage("La calificación debe estar entre 0 y 5");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    try {
      setSaving((prev) => ({ ...prev, [subject]: true }));
      await API.put(`/api/teacher/grades/${id}`, {
        subject,
        period: selectedPeriod,
        grade: Math.round(val * 10) / 10
      });
      // Forzar recarga sin caché
      const { data } = await API.get(`/api/teacher/students/${id}/grades?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" }
      });
      setGrades(data.grades || []);
      
      // Forzar actualización de estado de edición para esta materia
      setEditModes((prev) => ({ ...prev, [subject]: false }));
      
      setMessage("Guardado correctamente");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      setMessage("Error al guardar la nota");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setSaving((prev) => ({ ...prev, [subject]: false }));
    }
  };

  const cancelEdit = (subject) => {
    const current = gradeMap.get(`${subject}::${selectedPeriod}`);
    const hasGrade = typeof current === "number";
    if (hasGrade) {
      setEditModes((prev) => ({ ...prev, [subject]: false }));
      setEdited((prev) => ({ ...prev, [subject]: current.toFixed(1) }));
    } else {
      // Si no hay nota, no se puede cancelar el modo edición (o se limpia el input)
      setEdited((prev) => ({ ...prev, [subject]: "" }));
    }
  };

  return (
    <div className="container" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1>{student ? `Perfil de ${student.name}` : "Perfil del Estudiante"}</h1>
        <Link to="/profesor">
          <button className="button button-outline">Volver</button>
        </Link>
      </div>
      {student && <p style={{ color: "#64748b" }}>{student.email}</p>}
      {!isReady && (
        <p style={{ marginTop: 12 }}>{error || (loading ? "Cargando perfil..." : "Preparando datos...")}</p>
      )}

      {isReady && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {periods.map((p) => (
            <button
              key={p}
              className={selectedPeriod === p ? "button" : "button button-outline"}
              onClick={() => setSelectedPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {message && <p style={{ color: "#047857", fontWeight: 600, marginTop: 12 }}>{message}</p>}

      {isReady && (
        <div className="table-responsive" style={{ marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>Materia</th>
                <th>Nota ({selectedPeriod || "-"})</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{s}</td>
                  <td style={{ width: 160 }}>
                    {editModes[s] ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={edited[s] ?? ""}
                        onChange={(e) =>
                          setEdited((prev) => ({ ...prev, [s]: e.target.value }))
                        }
                        style={{ width: "100%", padding: 6 }}
                        placeholder="0.0 - 5.0"
                      />
                    ) : (
                      <span style={{ fontWeight: "bold", paddingLeft: 6 }}>
                        {edited[s] || "-"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editModes[s] ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="button"
                          disabled={!selectedPeriod || saving[s]}
                          onClick={() => saveOne(s)}
                        >
                          {saving[s] ? "Guardando..." : "Guardar"}
                        </button>
                        {typeof gradeMap.get(`${s}::${selectedPeriod}`) === "number" && (
                          <button
                            className="button button-outline"
                            onClick={() => cancelEdit(s)}
                            disabled={saving[s]}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className="button button--secondary"
                        onClick={() => {
                          console.log("Activando edición para:", s);
                          setEditModes((prev) => ({ ...prev, [s]: true }));
                        }}
                        style={{ backgroundColor: "#0b63f6", border: "none", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <Pencil size={16} /> Editar Nota
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
