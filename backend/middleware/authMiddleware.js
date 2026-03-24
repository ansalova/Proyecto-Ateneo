import jwt from "jsonwebtoken";
import { findById } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const dbUser = await findById(decoded.id);
      if (!dbUser) return res.status(401).json({ msg: "No autorizado, usuario no encontrado" });
      req.user = dbUser;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ msg: "No autorizado, token fallido" });
    }
  }

  return res.status(401).json({ msg: "No autorizado, no hay token" });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 authorize middleware - Roles requeridos:', roles);
    console.log('   Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    if (!req.user) {
      console.error('❌ No hay usuario en req.user');
      return res.status(403).json({ msg: 'Usuario no encontrado' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.error('❌ Rol no permitido:', req.user.role, 'Esperaba:', roles);
      return res.status(403).json({ msg: `Rol ${req.user.role} no autorizado. Se esperaba: ${roles.join(', ')}` });
    }
    
    console.log('✅ Autorización OK');
    next();
  };
};
