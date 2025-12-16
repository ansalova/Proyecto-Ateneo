import User from "../models/User.js";

// @desc    Obtener lista de estudiantes
// @route   GET /api/teacher/students
// @access  Private (Teacher/Admin)
export const getStudents = async (req, res) => {
  try {
    // Asumimos que los estudiantes tienen role 'user' o 'student'
    const students = await User.find({ role: { $in: ['user', 'student'] } }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener calificaciones (Mock por ahora)
// @route   GET /api/teacher/grades
// @access  Private (Teacher/Admin)
export const getGrades = async (req, res) => {
  try {
    // Datos simulados de calificaciones
    const grades = [
      { studentId: 1, name: "Juan Perez", subject: "Matemáticas", grade: 4.5 },
      { studentId: 2, name: "Maria Gomez", subject: "Historia", grade: 3.8 },
      { studentId: 3, name: "Carlos Ruiz", subject: "Ciencias", grade: 4.2 },
      { studentId: 4, name: "Ana Lopez", subject: "Inglés", grade: 5.0 },
    ];
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
