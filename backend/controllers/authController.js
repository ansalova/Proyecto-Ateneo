import { findByEmail, createUser, updateUserPassword, createPasswordReset, findValidPasswordReset, consumePasswordReset } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetEmail } from "../utils/mailer.js";

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email es requerido" });
    const user = await findByEmail(email);
    if (!user) return res.json({ msg: "Si el correo existe, se enviará un enlace de recuperación." });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await createPasswordReset({ user_id: user.id, token, expires_at: expires.toISOString() });

    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5173";
    const resetLink = `${frontendUrl}/restablecer?token=${token}`;

    let previewUrl = null;
    try {
      const mailInfo = await sendResetEmail({ to: user.email, link: resetLink });
      previewUrl = mailInfo.previewUrl || null;
    } catch (e) {
      console.error("Error enviando correo de recuperación:", e);
    }

    res.json({ msg: "Se generó el enlace de recuperación.", resetLink, previewUrl });
  } catch (error) {
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ msg: "Token y nueva contraseña son requeridos" });

    const pr = await findValidPasswordReset(token);
    if (!pr) return res.status(400).json({ msg: "Token inválido o expirado" });

    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword({ id: pr.user_id, password: hashed });
    await consumePasswordReset(token);

    res.json({ msg: "Contraseña restablecida correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
