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

// Todas las rutas requieren ser admin
router.use(protect, authorize('admin'));

// Dashboard estadísticas
router.get('/stats', getDashboardStats);

// Reportes de pagos
router.get('/payments/report', getPaymentReport);

// Actividad de últimos días
router.get('/activity', getActivitySummary);

// Lista de usuarios
router.get('/users', getUsersList);

// Promover usuario a admin
router.post('/users/:userId/make-admin', makeUserAdmin);

export default router;
