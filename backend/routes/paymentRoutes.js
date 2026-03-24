import express from 'express';
import { createCheckout, getOrders, getOrder, patchOrderStatus, sendPaymentInitEmail, getMyPaymentStatus } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, createCheckout);
router.post('/send-init-email', protect, sendPaymentInitEmail);

// Obtener estado de pagos del usuario actual
router.get('/my-status', protect, getMyPaymentStatus);

// list and inspect órdenes
router.get('/orders', protect, getOrders);
router.get('/orders/:reference', protect, getOrder);

// admin and teacher: actualizar estado manualmente
router.patch('/orders/:reference', protect, (req, res, next) => {
  // Permitir a admin y teacher
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    return next();
  }
  res.status(403).json({ error: 'forbidden', message: 'Solo administradores y profesores pueden actualizar pagos' });
}, patchOrderStatus);

export default router;
