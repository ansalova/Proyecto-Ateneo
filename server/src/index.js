/*
  Ateneo Payments Backend (Node/Express)
  - Real payments via Mercado Pago Checkout Pro (redirect flow)
  - Webhook endpoint to receive notifications
  - Extensible for additional providers (e.g., Wompi) in the future

  Requirements:
    - Node 18+
    - Environment variables (see README or .env.example):
      MP_ACCESS_TOKEN, FRONTEND_URL, BACKEND_URL, PORT

  Run (after creating package.json and installing deps):
    npm run dev
*/

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'
const PORT = process.env.PORT || 4000

// CORS: permitir frontend
app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // Ajusta si deseas restringir
    credentials: true
  })
)

// Mercado Pago SDK config
const mpAccessToken = process.env.MP_ACCESS_TOKEN || ''
const mpEnabled = Boolean(mpAccessToken)
let mpClient = null
let preferenceClient = null
let paymentClient = null

if (mpEnabled) {
  mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken })
  preferenceClient = new Preference(mpClient)
  paymentClient = new Payment(mpClient)
  console.log('[MP] SDK inicializado')
} else {
  console.warn('[MP] MP_ACCESS_TOKEN no configurado. Mercado Pago deshabilitado.')
}

// En memoria: referencia -> estado (para demo)
const orders = new Map()

function generateReference() {
  return 'ATENEO-' + Date.now()
}

function buildItemsFromMetadata(metadata, amount) {
  const items = []
  if (metadata && Array.isArray(metadata.items) && metadata.items.length) {
    for (const i of metadata.items) {
      items.push({
        id: String(i.id ?? 'mensualidad'),
        title: String(i.name ?? 'Mensualidad Ateneo'),
        quantity: Number(i.qty ?? 1),
        currency_id: 'COP',
        unit_price: Number(i.price ?? 0)
      })
    }
  } else {
    items.push({
      id: 'mensualidad',
      title: 'Mensualidad Ateneo',
      quantity: 1,
      currency_id: 'COP',
      unit_price: Number(amount)
    })
  }
  return items
}

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'payments', mp: mpEnabled })
})

// Crear checkout según método
app.post('/api/payments/checkout', async (req, res) => {
  try {
    const { method, amount, metadata } = req.body || {}
    if (!method) return res.status(400).json({ error: 'method is required' })
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'amount must be > 0' })

    // Datos de la orden
    const external_reference = generateReference()

    // Guarda orden inicial (pendiente)
    orders.set(external_reference, {
      status: 'pending',
      method,
      amount: Number(amount),
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    })

    // Métodos online via Mercado Pago
    if ((method === 'tarjeta' || method === 'pse')) {
      if (!mpEnabled) {
        return res.status(500).json({ error: 'Mercado Pago no configurado en el servidor' })
      }

      const items = buildItemsFromMetadata(metadata, amount)

      // Control por método
      const payment_methods = {}
      if (method === 'pse') {
        payment_methods.default_payment_method_id = 'pse'
      }

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
        metadata: {
          ...metadata,
          method
        },
        payment_methods
      }

      const pref = await preferenceClient.create({ body: preferenceBody })

      // Guarda referencia del preference
      orders.set(external_reference, {
        ...orders.get(external_reference),
        preference_id: pref.id,
        provider: 'mercadopago'
      })

      return res.json({
        success: true,
        provider: 'mercadopago',
        redirectUrl: pref.init_point || pref.sandbox_init_point,
        preferenceId: pref.id,
        externalReference: external_reference
      })
    }

    // Métodos offline (Nequi / Daviplata / Oficina)
    if (method === 'nequi' || method === 'daviplata' || method === 'oficina') {
      // NOTA: Para pagos reales con Nequi/Daviplata usa un gateway (p.ej. Wompi) y crea
      // un "payment source" y transacción. Aquí devolvemos instrucciones estáticas.
      const reference = external_reference
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
      }

      const data = instructions[method]
      return res.json({
        success: true,
        provider: 'offline',
        method,
        reference,
        instructions: data
      })
    }

    return res.status(400).json({ error: 'Método no soportado' })
  } catch (err) {
    console.error('checkout error:', err)
    res.status(500).json({ error: 'internal_error' })
  }
})

// Webhook Mercado Pago (acepta POST y GET por compatibilidad)
app.post('/api/payments/webhook/mercadopago', async (req, res) => {
  try {
    const body = req.body || {}
    // MP puede enviar diferentes formatos, aquí registramos y confirmamos recepción
    console.log('[MP] WEBHOOK POST:', JSON.stringify(body))

    // Si llega data.id y type === 'payment', podríamos consultar el detalle:
    // const { type, data } = body
    // if (type === 'payment' && data && data.id) {
    //   const payment = await paymentClient.get({ id: data.id })
    //   // Actualizar orders por external_reference (payment.external_reference)
    // }

    res.sendStatus(200)
  } catch (e) {
    console.error('webhook POST error:', e)
    res.sendStatus(200) // Evitar reintentos infinitos
  }
})

app.get('/api/payments/webhook/mercadopago', async (req, res) => {
  try {
    // Algunas integraciones envían GET con query: topic, id, etc.
    console.log('[MP] WEBHOOK GET:', JSON.stringify(req.query))
    res.sendStatus(200)
  } catch (e) {
    console.error('webhook GET error:', e)
    res.sendStatus(200)
  }
})

// Consulta simple por referencia (demo)
app.get('/api/orders/:reference', (req, res) => {
  const ref = req.params.reference
  const o = orders.get(ref)
  if (!o) return res.status(404).json({ error: 'not_found' })
  res.json(o)
})

app.listen(PORT, () => {
  console.log(`Payments server running on ${BACKEND_URL} (PORT ${PORT})`) 
  if (!mpEnabled) {
    console.log('Mercado Pago no está habilitado. Configura MP_ACCESS_TOKEN para pagos online.')
  }
})
