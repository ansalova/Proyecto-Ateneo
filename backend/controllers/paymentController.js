import dotenv from 'dotenv';
import { createOrder, findOrderByReference, updateOrderStatus } from '../models/Order.js';
import { getPool } from '../config/db.js';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function generateReference() {
  return 'ATENEO-' + Date.now();
}

// Validar que los meses en los items no sean meses pasados
function validateMonths(items) {
  if (!Array.isArray(items)) return true; // Sin items, no hay validación
  
  const currentMonthIndex = new Date().getMonth();
  const passedMonths = [];
  
  items.forEach(item => {
    if (item.metadata && item.metadata.month) {
      const monthIndex = MESES.indexOf(item.metadata.month);
      if (monthIndex >= 0 && monthIndex < currentMonthIndex) {
        passedMonths.push(item.metadata.month);
      }
    }
  });
  
  if (passedMonths.length > 0) {
    return {
      valid: false,
      message: `No puedes pagar meses que ya han pasado: ${passedMonths.join(', ')}`
    };
  }
  
  return { valid: true };
}

export const createCheckout = async (req, res) => {
  try {
    const { method, amount, metadata } = req.body || {};
    if (!method) return res.status(400).json({ error: 'method is required' });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'amount must be > 0' });

    // Validar que los meses no sean pasados
    const monthValidation = validateMonths(metadata?.items);
    if (!monthValidation.valid) {
      return res.status(400).json({ error: monthValidation.message });
    }

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

    // OFFLINE - Solo se aceptan pagos por Nequi y Daviplata
    if (['nequi', 'daviplata'].includes(method)) {
      const reference = external_reference;
      
      // Prioridad absoluta al número 3103115016 solicitado por el usuario
      const officialNumber = '3103115016';
      
      const instructions = {
        nequi: {
          title: 'Pago por Nequi',
          account: officialNumber,
          message: 'Envía el valor exacto y anexa la referencia en la descripción.'
        },
        daviplata: {
          title: 'Pago por Daviplata',
          account: officialNumber,
          message: 'Envía el valor exacto y anexa la referencia en la descripción.'
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

export const getOrders = async (req, res) => {
  try {
    const pool = getPool();
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

// Obtener estado de pagos del usuario actual (qué meses ya están pagados)
export const getMyPaymentStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    // Obtener todos los pagos del usuario que están completados
    const { rows: ordersRows } = await pool.query(
      `SELECT id, external_reference, status, metadata, created_at
       FROM orders
       WHERE metadata->>'user_id' = $1
       ORDER BY created_at DESC`,
      [String(userId)]
    );
    
    // Get user created_at
    const userRes = await pool.query("SELECT created_at FROM users WHERE id = $1", [String(userId)]);
    const userCreatedAt = userRes.rows[0]?.created_at;
    
    if (!userCreatedAt) {
      return res.status(500).json({ error: 'User created_at not found' });
    }
    
    const userCreatedYear = userCreatedAt.getFullYear();
    const userCreatedMonthIndex = userCreatedAt.getMonth(); // 0-11

    // Procesar para extraer meses pagados por status
    const monthStatus = {};
    const MESES_LIST = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Inicializar meses PAST con status 'past' (tachados, no cuentan)
    for (let i = 0; i < userCreatedMonthIndex; i++) {
      const month = MESES_LIST[i];
      monthStatus[month] = 'past';
    }

    // Inicializar meses desde creación de cuenta
    for (let i = userCreatedMonthIndex; i < 12; i++) {
      const month = MESES_LIST[i];
      monthStatus[month] = 'none';
    }

    // Procesar órdenes (solo meses desde creación)
    ordersRows.forEach(order => {
      try {
        const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : order.metadata;
        if (meta.items && Array.isArray(meta.items)) {
          meta.items.forEach(item => {
            const monthIndex = MESES_LIST.indexOf(item.metadata?.month);
            if (monthIndex >= userCreatedMonthIndex && monthStatus[item.metadata?.month] === 'none') {
              monthStatus[item.metadata?.month] = order.status;
            }
          });
        }
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    });

    res.json({ 
      monthStatus,
      accountStartMonth: MESES_LIST[userCreatedMonthIndex],
      totalRelevantMonths: 12 - userCreatedMonthIndex
    });
  } catch (error) {
    console.error('getMyPaymentStatus error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

