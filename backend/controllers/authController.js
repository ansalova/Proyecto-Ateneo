import { findByEmail, createUser } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await findByEmail(email);
    if (userExists) return res.status(400).json({ msg: "El email ya está registrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({ name, email, password: hashedPassword, role: role || "user" });

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(email);
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      msg: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error.message === "DB_NOT_CONFIGURED") {
      return res.status(500).json({ msg: "Base de datos no configurada. Configure PostgreSQL (DATABASE_URL) e intente nuevamente." });
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
