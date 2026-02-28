import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const FAILED_EMAILS_LOG = path.join(LOG_DIR, 'failed-emails.log');
if (!fs.existsSync(LOG_DIR)) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) { /* ignore */ }
}

function appendFailedEmailLog(entry) {
  try {
    fs.appendFileSync(FAILED_EMAILS_LOG, JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('[MAILER] No se pudo escribir en failed-emails.log', e.message);
  }
}

let transport = null;
let useTest = false;
let lastTestAccount = null;
let lastError = null;

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Si hay configuración SMTP completa, usar eso
  // Preferir SendGrid si se configuró (más fiable para entregabilidad)
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    console.log('[MAILER] ✅ Usando SendGrid SMTP (smtp.sendgrid.net:587)');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: { user: 'apikey', pass: sendgridKey }
    });
  }

  if (host && port && user && pass) {
    console.log(`[MAILER] ✅ Usando SMTP Real: ${host}:${port}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Development/Testing: Usar transporte local (sin requerer conexión externa)
  console.log('[MAILER] 📧 Modo Development: Emails se guardan localmente');
  console.log('[MAILER] 💡 Para producción, configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS en .env');
  
  useTest = true;
  return nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    logger: true,
    debug: true
  });
}

export async function getTransport() {
  if (!transport) {
    transport = await createTransport();
  }
  return transport;
}

export async function sendResetEmail({ to, link }) {
  try {
    const t = await getTransport();
    const from = process.env.SMTP_FROM || "Ateneo <no-reply@ateneo.local>";
    
    console.log(`[MAILER] 📧 Preparando email de reset para: ${to}`);
    
    const info = await t.sendMail({
      from,
      to,
      subject: "Recuperación de contraseña - Ateneo",
      text: `Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\nUsa este enlace para continuar:\n\n${link}\n\nEl enlace expirará en 1 hora.\n\nSi no fuiste tú, ignora este mensaje.\n`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h2 style="color: #333; margin-top: 0;">Recuperación de Contraseña</h2>
              <p style="color: #666; line-height: 1.6;">Hola,</p>
              <p style="color: #666; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Restablecer Contraseña</a>
              </div>
              <p style="color: #999; font-size: 12px;">Si no funcionó el botón, copia este enlace en tu navegador:<br/><code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${link}</code></p>
              <p style="color: #999; font-size: 12px;">Este enlace expirará en 1 hora.</p>
              <p style="color: #999; font-size: 12px;">Si no fuiste tú quien solicitó el cambio, ignora este mensaje.</p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[MAILER] ✅ Email preparado exitosamente.`);
    console.log(`[MAILER] 🔗 LINK DE RECUPERACIÓN:`);
    console.log(`[MAILER] 👉 ${link}`);
    
    return { messageId: info.messageId, previewUrl: link };
  } catch (error) {
    console.error('[MAILER] ❌ Error preparando email:', error.message);
    throw error;
  }
}

// --------------------------------------------------
// Emails relacionados con órdenes de pago
// --------------------------------------------------

export async function sendOrderEmail({ to, order }) {
  try {
    const t = await getTransport();
    const from = process.env.SMTP_FROM || "Ateneo <no-reply@ateneo.local>";
    const { external_reference, amount, method } = order;
    const subject = `Orden registrada - referencia ${external_reference}`;
    const text = `Gracias por tu transacción.\nReferencia: ${external_reference}\nMonto: $${amount}\nMétodo: ${method}\n`;
    const html = `
      <html><body style="font-family: Arial, sans-serif; background:#f7fafc; padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:24px;border-radius:8px;border:1px solid #e6edf3;">
          <h2 style="color:#0f172a;margin:0 0 8px 0;">Orden registrada</h2>
          <p style="color:#334155;margin:0 0 16px 0;">Gracias por tu transacción. Aquí están los detalles de tu orden.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:6px 0;color:#475569;">Referencia</td><td style="padding:6px 0;font-weight:700;">${external_reference}</td></tr>
            <tr><td style="padding:6px 0;color:#475569;">Monto</td><td style="padding:6px 0;font-weight:700;">$${amount}</td></tr>
            <tr><td style="padding:6px 0;color:#475569;">Método</td><td style="padding:6px 0;font-weight:700;">${method}</td></tr>
          </table>
          <p style="color:#64748b;font-size:13px;margin:0;">Si tienes preguntas, responde este correo o contacta a la Secretaría del colegio.</p>
        </div>
      </body></html>
    `;
    console.log(`[MAILER] 📧 Enviando email de orden a ${to}`);
    const result = await sendWithRetries(t, { from, to, subject, text, html }, 3);
    if (result.success) {
      const info = result.info;
      console.log('[MAILER] ✅ Email de orden preparado', info.messageId || info.accepted);
      if (useTest) {
        console.log('[MAILER] (modo test) contenido:', text);
      }
      return info;
    } else {
      console.error('[MAILER] ❌ No se pudo enviar email de orden después de reintentos', result.error?.message || result.error);
      throw result.error || new Error('send_failed');
    }
  } catch (err) {
    console.error('[MAILER] ❌ error enviando email de orden:', err.message);
    appendFailedEmailLog({ timestamp: new Date().toISOString(), to, subject, error: err.message });
    throw err;
  }
}

  // Helper: try send with retries and log on ultimate failure
  async function sendWithRetries(transport, mailOptions, maxRetries = 3) {
    let attempt = 0;
    let lastErr = null;
    while (attempt < maxRetries) {
      attempt += 1;
      try {
        const info = await transport.sendMail(mailOptions);
        return { success: true, info };
      } catch (e) {
        lastErr = e;
        console.warn(`[MAILER] intento ${attempt} fallido:`, e.message);
        // backoff
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
    // registrar fallo permanente
    appendFailedEmailLog({
      timestamp: new Date().toISOString(),
      to: mailOptions.to,
      subject: mailOptions.subject,
      error: lastErr ? lastErr.message : 'unknown'
    });
    return { success: false, error: lastErr };
  }

export async function sendOrderStatusEmail({ to, order, status }) {
  try {
    const t = await getTransport();
    const from = process.env.SMTP_FROM || "Ateneo <no-reply@ateneo.local>";
    const subject = `Estado de tu orden ${order.external_reference}: ${status}`;
    const text = `El estado de tu orden (${order.external_reference}) ha cambiado a: ${status}`;
    const html = `<p>El estado de tu orden (<strong>${order.external_reference}</strong>) ha cambiado a: <strong>${status}</strong></p>`;
    console.log(`[MAILER] 📧 Enviando email de estado a ${to}`);
    const res = await sendWithRetries(t, { from, to, subject, text, html }, 3);
    if (!res.success) {
      console.error('[MAILER] ❌ No se pudo enviar email de estado después de reintentos', res.error?.message || res.error);
      appendFailedEmailLog({ timestamp: new Date().toISOString(), to, subject, error: res.error?.message || String(res.error) });
    }
  } catch (err) {
    console.error('[MAILER] ❌ error enviando email de estado de orden:', err.message);
  }
}

