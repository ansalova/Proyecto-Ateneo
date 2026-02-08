import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Registrar usuario
router.post("/register", register);

// Login usuario
router.post("/login", login);

export default router;
