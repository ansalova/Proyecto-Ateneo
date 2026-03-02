import express from 'express';
import { createCheckout, receiveWebhook, receiveWebhookGet, getOrders, getOrder, patchOrderStatus, sendPaymentInitEmail } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', createCheckout);
router.post('/webhook/mercadopago', receiveWebhook);
router.get('/webhook/mercadopago', receiveWebhookGet);
router.post('/send-init-email', protect, sendPaymentInitEmail);

// list and inspect órdenes
router.get('/orders', protect, getOrders);
router.get('/orders/:reference', protect, getOrder);

// admin only: actualizar estado manualmente
router.patch('/orders/:reference', protect, authorize('admin'), patchOrderStatus);

export default router;
