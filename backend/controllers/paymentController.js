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

    // enriquecer metadata con usuario (para poder enviar notificaciones posteriores)
    const fullMetadata = {
      ...metadata,
      user_id: req.user?.id,
      // preferir email del usuario autenticado, luego metadata o body
      user_email: req.user?.email || (metadata && metadata.user_email) || req.body?.email
    };

    // Determinar destinatario del correo (usuario autenticado o email proporcionado)
    const recipientEmail = req.user?.email || (metadata && metadata.user_email) || req.body?.email || fullMetadata.user_email;

    // Guardar orden inicial en BD (incluyendo email si fue provisto)
    await createOrder({
      external_reference,
      method,
      amount: Number(amount),
      metadata: fullMetadata
    });

    // Enviar correo de confirmación al usuario si se tiene un email destinatario
    let emailSent = false;
    let emailError = null;
    if (recipientEmail) {
      try {
        console.log('[PAYMENTS] Enviando correo de orden a', recipientEmail);
        const { sendOrderEmail } = await import('../utils/mailer.js');
        const info = await sendOrderEmail({ to: recipientEmail, order: { external_reference, amount, method } });
        emailSent = Boolean(info && (info.accepted?.length || info.messageId));
        if (!emailSent) {
          emailError = 'no_accepted';
        }
      } catch (e) {
        console.error('[PAYMENTS] Error enviando correo orden:', e);
        emailError = e.message || String(e);
      }
    }

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
          success: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=success&reference=${external_reference}`,
          pending: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=pending&reference=${external_reference}`,
          failure: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=failure&reference=${external_reference}`
        },
        auto_return: 'approved',
        notification_url: `${BACKEND_URL}/api/payments/webhook/mercadopago`,
        external_reference,
        metadata: { ...fullMetadata, method },
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
        externalReference: external_reference,
        emailSent,
        emailError
      });
    }

    // OFFLINE
    if (['nequi', 'daviplata', 'oficina'].includes(method)) {
      const reference = external_reference;
      const instructions = {
        nequi: {
          title: 'Pago por Nequi',
          account: process.env.NEQUI_NUMBER || '0000000000',
          message: 'Envía el valor exacto y anexa la referencia en la descripción.'
        },
        daviplata: {
          title: 'Pago por Daviplata',
          account: process.env.DAVIPLATA_NUMBER || '0000000000',
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
        instructions: instructions[method],
        emailSent,
        emailError
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
    
    // Procesar notificaciones de Mercado Pago
    const topic = body.action || body.type;
    
    if (topic === 'payment.updated' || topic === 'payment.created') {
      const paymentId = body.data?.id;
      if (paymentId && paymentClient) {
        try {
          const payment = await paymentClient.get({ id: paymentId });
          const externalRef = payment.external_reference;
          const status = payment.status; // approved, pending, rejected, etc.
          
          if (externalRef) {
            const dbStatus = status === 'approved' ? 'completed' : 
                           status === 'pending' ? 'pending' : 
                           status === 'rejected' ? 'failed' : 'processing';
            
            const order = await updateOrderStatus(externalRef, dbStatus);
            console.log(`[MP] Orden actualizada: ${externalRef} -> ${dbStatus}`, order);
          }
        } catch (err) {
          console.error('[MP] Error al procesar pago:', err.message);
        }
      }
    }
    
    res.sendStatus(200);
  } catch (e) {
    console.error('webhook POST error:', e);
    res.sendStatus(200);
  }
};

export const receiveWebhookGet = async (req, res) => {
  try {
    console.log('[MP] WEBHOOK GET (confirmación de recepción):', JSON.stringify(req.query));
    
    // Mercado Pago típicamente envía un GET para confirmación
    // Solo log y respuesta 200 es suficiente
    res.sendStatus(200);
  } catch (e) {
    console.error('webhook GET error:', e);
    res.sendStatus(200);
  }
};

export const getOrders = async (req, res) => {
  try {
    const pool = require('../config/db.js').getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const userId = req.user?.id;
    const userRole = req.user?.role;
    let query;
    let params = [];

    if (userRole === 'admin') {
      query = `SELECT id, external_reference, amount, method, status, created_at, metadata
               FROM orders
               ORDER BY created_at DESC
               LIMIT 200`;
    } else {
      query = `SELECT id, external_reference, amount, method, status, created_at, metadata
               FROM orders
               WHERE metadata->>'user_id' = $1
               ORDER BY created_at DESC`;
      params = [String(userId)];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ error: 'internal_error' });
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

// Permite a un administrador actualizar el estado de una orden manualmente
export const patchOrderStatus = async (req, res) => {
  try {
    const ref = req.params.reference;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status is required' });

    // Validar estados permitidos
    const valid = ['pending', 'completed', 'failed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'invalid_status', valid });
    }

    const updated = await updateOrderStatus(ref, status);
    if (!updated) return res.status(404).json({ error: 'not_found' });

    // Si tenemos correo en metadata, avisar al usuario
    const metadata = updated.metadata || {};
    const email = metadata.user_email;
    if (email) {
      import("../utils/mailer.js").then(({ sendOrderStatusEmail }) => {
        sendOrderStatusEmail({ to: email, order: updated, status }).catch(e => console.error('[PAYMENTS] Error enviando status email:', e));
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('patchOrderStatus error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const sendPaymentInitEmail = async (req, res) => {
  try {
    const { studentName, amount, method, reference } = req.body || {};
    const to = req.user?.email;

    if (!to) {
      return res.status(400).json({ error: 'User email not found' });
    }

    if (!studentName || !amount || !method || !reference) {
      return res.status(400).json({ error: 'Missing required fields: studentName, amount, method, reference' });
    }

    const { sendPaymentInitEmail: sendEmail } = await import('../utils/mailer.js');
    const info = await sendEmail({ to, studentName, amount, method, reference });

    res.json({
      success: true,
      message: 'Correo de confirmación de pago enviado',
      messageId: info?.messageId || info?.accepted?.[0] || 'sent'
    });
  } catch (error) {
    console.error('sendPaymentInitEmail error:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo de confirmación' });
  }
};

