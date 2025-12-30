import express from 'express';
import { createCheckout, receiveWebhook, receiveWebhookGet, getOrder, listOrders, getOrderDetails, retryCheckout } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, createCheckout);
router.post('/webhook/mercadopago', receiveWebhook);
router.get('/webhook/mercadopago', receiveWebhookGet);
router.get('/orders', protect, listOrders);
router.get('/orders/:reference', protect, getOrder);
router.get('/orders/:reference/details', protect, getOrderDetails);
router.post('/orders/:reference/retry', protect, retryCheckout);

export default router;
