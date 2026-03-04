import { findByEmail, createUser, countAdmins, updatePassword, findById, updateUser } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../utils/mailer.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, inviteCode, document_type, document_number } = req.body;

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
      // allow a sensible default when ENV var is missing (development convenience)
      let teacherCodeRaw = process.env.TEACHER_INVITE_CODE || 'Profesores010';
      if (!process.env.TEACHER_INVITE_CODE) {
        console.warn('TEACHER_INVITE_CODE not set, defaulting to Profesores010');
      }
      // normalize developer input/code
      let teacherCode = teacherCodeRaw.trim().toUpperCase();
      const provided = (inviteCode || '').trim().toUpperCase();
      if (provided !== teacherCode) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Failed teacher invite code check (provided="${inviteCode}", expected="${teacherCode}")`);
        }
        const msg = process.env.NODE_ENV !== 'production'
          ? `Clave única inválida para profesor (esperaba: ${teacherCodeRaw})` // show raw expected in dev
          : 'Clave única inválida para profesor.';
        return res.status(403).json({ msg });
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

    const newUser = await createUser({ name, email, password: hashedPassword, role: finalRole, document_type, document_number });

    // generar token de verificación (1 día)
    const verifyToken = jwt.sign({ id: newUser.id, email: newUser.email, type: 'verify_email' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verifyLink = `${backendUrl}/api/auth/verify-email?token=${verifyToken}`;

    try {
      const { sendVerificationEmail } = await import('../utils/mailer.js');
      await sendVerificationEmail({ to: newUser.email, link: verifyLink });
      console.log('[AUTH] Email de verificación enviado a', newUser.email);
    } catch (emailErr) {
      console.error('[AUTH] Error enviando email de verificación:', emailErr.message);
    }

    res.json({ msg: "Usuario registrado correctamente. Revisa tu correo para verificar la cuenta." });
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

    // include verified flag so frontend can warn/resend
    res.json({
      msg: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified }
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

// Verificar correo a través de token en query
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Token de verificación requerido');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).send('Token inválido o expirado');
    }
    if (decoded.type !== 'verify_email') {
      return res.status(400).send('Token de verificación inválido');
    }
    // marcar usuario como verificado
    await updateUser(decoded.id, { verified: true });
    // redirigir o proveer mensaje
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?verified=1`);
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).send('Error interno');
  }
};

// Devuelve la información del perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
    // ensure password removed if present and include verified flag
    delete user.password;
    res.json({ user: { ...user, verified: user.verified } });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// Actualiza algunos campos del perfil; si se envía password se guarda hasheada
export const resendVerification = async (req, res) => {
  try {
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
    if (user.verified) {
      return res.status(400).json({ msg: "La cuenta ya está verificada" });
    }
    const verifyToken = jwt.sign({ id: user.id, email: user.email, type: 'verify_email' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verifyLink = `${backendUrl}/api/auth/verify-email?token=${verifyToken}`;
    try {
      const { sendVerificationEmail } = await import('../utils/mailer.js');
      await sendVerificationEmail({ to: user.email, link: verifyLink });
      console.log('[AUTH] Email de verificación re-enviado a', user.email);
    } catch (emailErr) {
      console.error('[AUTH] Error re-enviando email de verificación:', emailErr.message);
      // we don't fail the request on email error; still return success
    }
    res.json({ msg: "Enlace de verificación reenviado" });
  } catch (error) {
    console.error('resendVerification error:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, document_type, document_number, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (document_type !== undefined) updates.document_type = document_type;
    if (document_number !== undefined) updates.document_number = document_number;
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    // Si se intenta cambiar el email, verificar que no exista otro usuario con el mismo
    let emailChanged = false;
    if (updates.email) {
      const existing = await findByEmail(updates.email);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ msg: "El email ya está en uso por otro usuario" });
      }
      emailChanged = true;
      // invalidate verification flag
      updates.verified = false;
    }

    const updated = await updateUser(req.user.id, updates);

    // si cambiamos email, reenviar verificación automáticamente
    if (emailChanged && updated) {
      try {
        const verifyToken = jwt.sign({ id: updated.id, email: updated.email, type: 'verify_email' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const verifyLink = `${backendUrl}/api/auth/verify-email?token=${verifyToken}`;
        const { sendVerificationEmail } = await import('../utils/mailer.js');
        await sendVerificationEmail({ to: updated.email, link: verifyLink });
      } catch (emailErr) {
        console.error('[AUTH] Error enviando email de verificación tras cambio de email:', emailErr.message);
      }
    }

    let responseMsg = "Perfil actualizado";
    if (emailChanged) {
      responseMsg = "Perfil actualizado. Revisa tu correo para verificar el nuevo email.";
    }
    if (!updated) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: responseMsg, user: updated });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
