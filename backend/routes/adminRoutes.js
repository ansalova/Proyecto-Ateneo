import express from 'express';
import {
  getDashboardStats,
  getPaymentReport,
  getUsersList,
  makeUserAdmin,
  getActivitySummary
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Dashboard estadísticas - admin only
router.get('/stats', authorize('admin'), getDashboardStats);

// Reportes de pagos - permitir a admin y teacher
router.get('/payments/report', (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    return next();
  }
  res.status(403).json({ error: 'forbidden', message: 'Solo administradores y profesores pueden ver pagos' });
}, getPaymentReport);

// Actividad de últimos días - admin only
router.get('/activity', authorize('admin'), getActivitySummary);

// Lista de usuarios - admin only
router.get('/users', authorize('admin'), getUsersList);

// Promover usuario a admin - admin only
router.post('/users/:userId/make-admin', authorize('admin'), makeUserAdmin);

export default router;
