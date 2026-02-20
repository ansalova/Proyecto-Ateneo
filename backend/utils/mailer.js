import nodemailer from "nodemailer";

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

