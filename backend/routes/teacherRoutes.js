import express from "express";
import { getStudents, getGrades } from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas protegidas para profesores y administradores
router.get("/students", protect, authorize("teacher", "admin"), getStudents);
router.get("/grades", protect, authorize("teacher", "admin"), getGrades);

export default router;
