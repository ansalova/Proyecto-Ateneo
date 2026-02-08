import express from "express";
import { getMyGrades } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas protegidas para estudiantes
router.get("/my-grades", protect, getMyGrades);

export default router;
