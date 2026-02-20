import { findByEmail, createUser, countAdmins, updatePassword, findById } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../utils/mailer.js";

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

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[AUTH] Solicitud forgot-password para: ${email}`);

    if (!email) {
      console.log('[AUTH] Email no proporcionado');
      return res.status(400).json({ msg: "Email es requerido" });
    }

    const user = await findByEmail(email);
    console.log(`[AUTH] Usuario encontrado: ${user ? 'sí' : 'no'}`);
    if (!user) {
      // No decimos que el email no existe por seguridad
      return res.json({ msg: "Si el email existe, recibirás instrucciones de recuperación" });
    }

    // Generar token JWT válido por 1 hora
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // URL del frontend con el token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Enviar email
    try {
      await sendResetEmail({
        to: user.email,
        link: resetLink
      });
      console.log(`[AUTH] Email de reset enviado a: ${user.email}`);
    } catch (emailErr) {
      console.error('[AUTH] Error sending reset email:', emailErr.message, emailErr);
      // En producción, fallar si el email no se envía
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          msg: "Error al enviar email de recuperación. Por favor intenta más tarde." 
        });
      }
      // En desarrollo, continuar de todos modos (para testing)
      console.log('[AUTH] Continuando en desarrollo a pesar del error de email');
    }

    res.json({ 
      msg: "Si el email existe, recibirás instrucciones de recuperación",
      // En desarrollo, mostrar el link en la respuesta para testing
      ...(process.env.NODE_ENV !== 'production' && { resetLink })
    });
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// Validar token y resetear contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ msg: "Token y contraseña requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar y decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ msg: "Token inválido" });
    }

    // Verificar que el usuario existe
    const user = await findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(decoded.id, hashedPassword);

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
