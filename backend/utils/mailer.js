import nodemailer from "nodemailer";

let transport = null;
let useTest = false;
let lastTestAccount = null;

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  useTest = true;
  lastTestAccount = testAccount;
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function getTransport() {
  if (!transport) {
    transport = await createTransport();
  }
  return transport;
}

export async function sendResetEmail({ to, link }) {
  const t = await getTransport();
  const from = process.env.SMTP_FROM || "Ateneo <no-reply@ateneo.local>";
  const info = await t.sendMail({
    from,
    to,
    subject: "Recuperación de contraseña",
    text: `Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\nUsa este enlace para continuar:\n\n${link}\n\nSi no fuiste tú, ignora este mensaje.\n`,
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${link}">Haz clic aquí para restablecer tu contraseña</a></p>
      <p>Si no fuiste tú, ignora este mensaje.</p>
    `,
  });
  const preview = useTest ? nodemailer.getTestMessageUrl(info) : null;
  return { messageId: info.messageId, previewUrl: preview };
}

