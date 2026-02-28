import dotenv from 'dotenv';
import { sendOrderEmail } from './utils/mailer.js';

dotenv.config();

(async () => {
  try {
    console.log('Enviando correo de prueba a', process.env.SMTP_USER);
    const info = await sendOrderEmail({
      to: process.env.SMTP_USER,
      order: { external_reference: 'TEST-EMAIL-' + Date.now(), amount: 1, method: 'test' }
    });
    console.log('Resultado sendOrderEmail:', info);
  } catch (e) {
    console.error('Error en sendOrderEmail:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();