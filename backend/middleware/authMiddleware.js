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
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "No autorizado, token fallido" });
    }
  }

  if (!token) {
    res.status(401).json({ msg: "No autorizado, no hay token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `Rol ${req.user ? req.user.role : 'desconocido'} no autorizado para acceder a esta ruta` });
    }
    next();
  };
};
