import express from "express";
import { register, login, requestPasswordReset, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// Registrar usuario
router.post("/register", register);

// Login usuario
router.post("/login", login);

// Solicitar recuperación de contraseña
router.post("/forgot-password", requestPasswordReset);

// Resetear contraseña con token
router.post("/reset-password", resetPassword);

export default router;
