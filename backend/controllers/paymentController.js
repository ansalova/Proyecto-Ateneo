import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createOrder, addOrderItems, findOrderByReference, listOrdersByUser, listOrderItems, updateOrderStatus } from '../models/Order.js';
import { createPayment, listPaymentsByOrder, findPaymentByMpId, updatePaymentStatus } from '../models/Payment.js';
import dotenv from 'dotenv';

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

const orders = new Map();

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

    const dbOrder = await createOrder({
      external_reference,
      user_id: req.user?.id || null,
      amount: Number(amount),
      method,
      status: 'pending',
      metadata: metadata || {}
    });
    const itemsForDb = buildItemsFromMetadata(metadata, amount).map(i => ({ ...i, metadata: metadata }));
    await addOrderItems(dbOrder.id, itemsForDb);

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
        metadata: { ...metadata, method },
        payment_methods
      };

      const pref = await preferenceClient.create({ body: preferenceBody });
      await createPayment({
        order_id: dbOrder.id,
        provider: 'mercadopago',
        preference_id: pref.id,
        status: 'initiated',
        raw_response: pref
      });

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

      await createPayment({
        order_id: dbOrder.id,
        provider: 'offline',
        status: 'pending',
        raw_response: { instructions: instructions[method] }
      });
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
    const q = req.query || {};
    const id =
      body?.data?.id ||
      body?.id ||
      q?.id ||
      q?.data_id ||
      null;

    if (!id) {
      console.warn('[MP] webhook sin id', JSON.stringify({ body, q }));
      return res.sendStatus(200);
    }

    const info = await paymentClient.get({ id });
    const status = info?.status || 'unknown';
    const external_reference = info?.external_reference || info?.metadata?.external_reference || null;

    if (!external_reference) {
      console.warn('[MP] pago sin external_reference', JSON.stringify(info));
      return res.sendStatus(200);
    }

    const order = await findOrderByReference(external_reference);
    if (!order) {
      console.warn('[MP] orden no encontrada para ref', external_reference);
      return res.sendStatus(200);
    }

    const existing = await findPaymentByMpId(String(id));
    if (existing) {
      await updatePaymentStatus({ id: existing.id, status, raw_response: info });
    } else {
      await createPayment({
        order_id: order.id,
        provider: 'mercadopago',
        mp_payment_id: String(id),
        status,
        raw_response: info
      });
    }

    const newStatus =
      status === 'approved' ? 'approved' :
      status === 'pending' ? 'pending' :
      status === 'in_process' ? 'pending' :
      status === 'rejected' ? 'rejected' : order.status;
    if (newStatus !== order.status) {
      await updateOrderStatus({ id: order.id, status: newStatus });
    }

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
  const ref = req.params.reference;
  const o = await findOrderByReference(ref);
  if (!o) return res.status(404).json({ error: 'not_found' });
  res.json(o);
};

export const listOrders = async (req, res) => {
  const os = await listOrdersByUser(req.user.id);
  res.json(os);
};

export const getOrderDetails = async (req, res) => {
  const ref = req.params.reference;
  const o = await findOrderByReference(ref);
  if (!o) return res.status(404).json({ error: 'not_found' });
  const items = await listOrderItems(o.id);
  const payments = await listPaymentsByOrder(o.id);
  res.json({ order: o, items, payments });
};

export const retryCheckout = async (req, res) => {
  try {
    const ref = req.params.reference;
    const o = await findOrderByReference(ref);
    if (!o) return res.status(404).json({ error: 'not_found' });

    if (!mpEnabled) return res.status(500).json({ error: 'Mercado Pago no configurado' });
    if (!(o.method === 'tarjeta' || o.method === 'pse')) return res.status(400).json({ error: 'Solo aplica para tarjeta/PSE' });

    const items = buildItemsFromMetadata(o.metadata, o.amount);
    const payment_methods = {};
    if (o.method === 'pse') payment_methods.default_payment_method_id = 'pse';

    const preferenceBody = {
      items,
      back_urls: {
        success: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=success&reference=${ref}`,
        pending: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=pending&reference=${ref}`,
        failure: `${FRONTEND_URL}/confirmacion-pago?provider=mp&result=failure&reference=${ref}`
      },
      auto_return: 'approved',
      notification_url: `${BACKEND_URL}/api/payments/webhook/mercadopago`,
      external_reference: ref,
      metadata: { ...o.metadata, method: o.method },
      payment_methods
    };

    const pref = await preferenceClient.create({ body: preferenceBody });
    await createPayment({
      order_id: o.id,
      provider: 'mercadopago',
      preference_id: pref.id,
      status: 'initiated',
      raw_response: pref
    });

    res.json({
      success: true,
      provider: 'mercadopago',
      redirectUrl: pref.init_point || pref.sandbox_init_point,
      preferenceId: pref.id,
      externalReference: ref
    });
  } catch (e) {
    console.error('retry error:', e);
    res.status(500).json({ error: 'internal_error' });
  }
};
