import express from "express";
import { register, login, requestPasswordReset, resetPassword, getProfile, updateProfile, verifyEmail, resendVerification } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registrar usuario
router.post("/register", register);

// Login usuario
router.post("/login", login);

// Solicitar recuperación de contraseña
router.post("/forgot-password", requestPasswordReset);

// Resetear contraseña con token
router.post("/reset-password", resetPassword);

// Perfil de usuario
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.post("/resend-verification", protect, resendVerification);

// Verificación de email (link enviado por correo)
router.get("/verify-email", verifyEmail);

export default router;
