import { findByEmail, createUser, countAdmins } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, inviteCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Por favor complete todos los campos" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Formato de email inválido" });
    }

    const userExists = await findByEmail(email);
    if (userExists) return res.status(400).json({ msg: "El email ya está registrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalRole = "student";
    const requestedRole = (role || "").toLowerCase();
    if (requestedRole === "teacher") {
      if (!process.env.TEACHER_INVITE_CODE) {
        return res.status(500).json({ msg: "Clave única de profesor no configurada." });
      }
      if (inviteCode !== process.env.TEACHER_INVITE_CODE) {
        return res.status(403).json({ msg: "Clave única inválida para profesor." });
      }
      finalRole = "teacher";
    } else if (requestedRole === "admin") {
      if (process.env.ADMIN_SELF_REGISTRATION !== "true") {
        return res.status(403).json({ msg: "Registro de administrador deshabilitado." });
      }
      const adminCount = await countAdmins();
      if (adminCount > 0) {
        return res.status(403).json({ msg: "Ya existe un administrador. Solicite al administrador actual crear nuevas cuentas de administrador." });
      }
      if (!process.env.ADMIN_INVITE_CODE) {
        return res.status(500).json({ msg: "Clave única de administrador no configurada." });
      }
      if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
        return res.status(403).json({ msg: "Clave única inválida para administrador." });
      }
      finalRole = "admin";
    }

    await createUser({ name, email, password: hashedPassword, role: finalRole });

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
