import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// Registrar usuario
router.post("/register", register);

// Login usuario
router.post("/login", login);

// Recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
