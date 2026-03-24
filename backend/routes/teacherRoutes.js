import express from "express";
import { getStudents, getGrades, saveGrade, getSubjects, getPeriods, getStudentProfile } from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas protegidas para profesores y administradores
router.get("/students", protect, authorize("teacher", "admin"), getStudents);
router.get("/grades", protect, authorize("teacher", "admin"), getGrades);
router.put("/grades/:studentId", protect, authorize("teacher", "admin"), saveGrade);
router.get("/subjects", protect, authorize("teacher", "admin"), getSubjects);
router.get("/periods", protect, authorize("teacher", "admin"), getPeriods);
router.get("/students/:studentId/grades", protect, authorize("teacher", "admin"), getStudentProfile);

export default router;
