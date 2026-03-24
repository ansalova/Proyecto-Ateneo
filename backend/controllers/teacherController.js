import { findStudents, findById } from "../models/User.js";
import { getGradesForStudents, upsertGrade, getGradeHistoryForStudent, getGradesForStudent } from "../models/Grade.js";
const SUBJECTS = ["Matemáticas","Español","Ciencias","Historia","Inglés","Arte","Educación Física","Tecnología"];
const PERIODS = ["2026-I","2026-II","2026-III","2026-IV"];

// @desc    Obtener lista de estudiantes
// @route   GET /api/teacher/students
// @access  Private (Teacher/Admin)
export const getStudents = async (req, res) => {
  try {
    const students = await findStudents();
    res.json(students);
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// @desc    Obtener calificaciones (Mock por ahora)
// @route   GET /api/teacher/grades
// @access  Private (Teacher/Admin)
export const getGrades = async (req, res) => {
  try {
    const grades = await getGradesForStudents();
    res.json(grades);
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const saveGrade = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, period, grade } = req.body;
    const s = String(subject || "").trim();
    if (!SUBJECTS.includes(s)) {
      return res.status(400).json({ msg: "Materia inválida" });
    }
    const p = String(period || "").trim();
    if (!PERIODS.includes(p)) {
      return res.status(400).json({ msg: "Periodo inválido" });
    }
    let num = Number(grade);
    if (Number.isNaN(num)) {
      return res.status(400).json({ msg: "Calificación inválida" });
    }
    if (num < 0 || num > 5) {
      return res.status(400).json({ msg: "Calificación debe estar entre 0 y 5" });
    }
    num = Math.round(num * 10) / 10;
    const saved = await upsertGrade({ studentId: Number(studentId), subject: s, period: p, grade: num, updatedBy: req.user.id });
    res.json(saved);
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getSubjects = async (req, res) => {
  res.json(SUBJECTS);
};

export const getPeriods = async (req, res) => {
  res.json(PERIODS);
};

export const getStudentGradeHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await getGradeHistoryForStudent(Number(studentId));
    res.json(history);
  } catch (error) {
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await findById(Number(studentId));
    if (!student || !["user","student"].includes(student.role)) {
      return res.status(404).json({ msg: "Estudiante no encontrado" });
    }
    const grades = await getGradesForStudent(Number(studentId));
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      student,
      grades,
      subjects: SUBJECTS,
      periods: PERIODS
    });
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
