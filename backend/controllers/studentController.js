import { getGradesForStudent } from "../models/Grade.js";

// @desc    Obtener mis calificaciones
// @route   GET /api/student/my-grades
// @access  Private (Student)

export const getMyGrades = async (req, res) => {
  try {
    const grades = await getGradesForStudent(req.user.id);

    res.json({
      name: req.user.name,
      email: req.user.email,
      grades
    });

  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada." });
    }
    console.error(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
