import express from 'express';
import { createCheckout, receiveWebhook, receiveWebhookGet, getOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/checkout', createCheckout);
router.post('/webhook/mercadopago', receiveWebhook);
router.get('/webhook/mercadopago', receiveWebhookGet);
router.get('/orders/:reference', getOrder);

export default router;
