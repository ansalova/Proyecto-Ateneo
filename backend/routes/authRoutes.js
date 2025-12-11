import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===========================
   📌 Registro de usuario
   =========================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validación mínima
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(400).json({ msg: "El correo ya está registrado" });

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPass,
    });

    await newUser.save();

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error en /register:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
});

/* ===========================
   📌 Login de usuario
   =========================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación mínima
    if (!email || !password)
      return res.status(400).json({ msg: "Los campos son obligatorios" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ msg: "Contraseña incorrecta" });

    // Generar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
});

export default router;
