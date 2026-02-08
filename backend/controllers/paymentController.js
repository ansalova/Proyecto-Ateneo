import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import { createOrder, findOrderByReference, updateOrderStatus } from '../models/Order.js';

dotenv.config();

// Mercado Pago SDK config
const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
const mpEnabled = Boolean(mpAccessToken);
let mpClient = null;
let preferenceClient = null;
let paymentClient = null;

if (mpEnabled) {
  mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
  preferenceClient = new Preference(mpClient);
  paymentClient = new Payment(mpClient);
  console.log('[MP] SDK inicializado');
} else {
  console.warn('[MP] MP_ACCESS_TOKEN no configurado. Mercado Pago deshabilitado.');
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function generateReference() {
  return 'ATENEO-' + Date.now();
}

function buildItemsFromMetadata(metadata, amount) {
  const items = [];
  if (metadata && Array.isArray(metadata.items) && metadata.items.length) {
    for (const i of metadata.items) {
      items.push({
        id: String(i.id ?? 'mensualidad'),
        title: String(i.name ?? 'Mensualidad Ateneo'),
        quantity: Number(i.qty ?? 1),
        currency_id: 'COP',
        unit_price: Number(i.price ?? 0)
      });
    }
  } else {
    items.push({
      id: 'mensualidad',
      title: 'Mensualidad Ateneo',
      quantity: 1,
      currency_id: 'COP',
      unit_price: Number(amount)
    });
  }
  return items;
}

export const createCheckout = async (req, res) => {
  try {
    const { method, amount, metadata } = req.body || {};
    if (!method) return res.status(400).json({ error: 'method is required' });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'amount must be > 0' });

    const external_reference = generateReference();

    // Guardar orden inicial en BD
    await createOrder({
      external_reference,
      method,
      amount: Number(amount),
      metadata: metadata || {}
    });

    // ONLINE: Mercado Pago
    if (method === 'tarjeta' || method === 'pse') {
      if (!mpEnabled) {
        return res.status(500).json({ error: 'Mercado Pago no configurado en el servidor' });
      }

      const items = buildItemsFromMetadata(metadata, amount);
      const payment_methods = {};
      if (method === 'pse') payment_methods.default_payment_method_id = 'pse';

      const preferenceBody = {
        items,
        back_urls: {
          success: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=success`,
          pending: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=pending`,
          failure: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=failure`
        },
        auto_return: 'approved',
        notification_url: `${BACKEND_URL}/api/payments/webhook/mercadopago`,
        external_reference,
        metadata: { ...metadata, method },
        payment_methods
      };

      const pref = await preferenceClient.create({ body: preferenceBody });

      // Actualizar orden con ID de preferencia si es necesario, 
      // o simplemente confiar en la referencia externa.
      // Por simplicidad, no guardamos preference_id en la tabla orders por ahora,
      // pero podríamos agregarlo a la tabla.

      return res.json({
        success: true,
        provider: 'mercadopago',
        redirectUrl: pref.init_point || pref.sandbox_init_point,
        preferenceId: pref.id,
        externalReference: external_reference
      });
    }

    // OFFLINE
    if (['nequi', 'daviplata', 'oficina'].includes(method)) {
      const reference = external_reference;
      const instructions = {
        nequi: {
          title: 'Pago por Nequi',
          account: process.env.NEQUI_NUMBER || '3000000000',
          message: 'Envía el valor exacto y anexa la referencia en la descripción.'
        },
        daviplata: {
          title: 'Pago por Daviplata',
          account: process.env.DAVIPLATA_NUMBER || '3100000000',
          message: 'Envía el valor exacto y anexa la referencia en la descripción.'
        },
        oficina: {
          title: 'Pago en Secretaría',
          message: 'Dirígete a la Secretaría del colegio con la referencia generada.'
        }
      };

      return res.json({
        success: true,
        provider: 'offline',
        method,
        reference,
        instructions: instructions[method]
      });
    }

    return res.status(400).json({ error: 'Método no soportado' });
  } catch (err) {
    console.error('checkout error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const body = req.body || {};
    console.log('[MP] WEBHOOK POST:', JSON.stringify(body));
    res.sendStatus(200);
  } catch (e) {
    console.error('webhook POST error:', e);
    res.sendStatus(200);
  }
};

export const receiveWebhookGet = async (req, res) => {
  try {
    console.log('[MP] WEBHOOK GET:', JSON.stringify(req.query));
    res.sendStatus(200);
  } catch (e) {
    console.error('webhook GET error:', e);
    res.sendStatus(200);
  }
};

export const getOrder = async (req, res) => {
  try {
    const ref = req.params.reference;
    const o = await findOrderByReference(ref);
    if (!o) return res.status(404).json({ error: 'not_found' });
    res.json(o);
  } catch (error) {
    console.error('getOrder error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};
