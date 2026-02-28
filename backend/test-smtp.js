import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Probando conexión SMTP a Gmail (puerto 465 - SSL)...');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error SMTP:', error.message);
    console.error('Código:', error.code);
  } else {
    console.log('✅ Conexión SMTP exitosa!');
  }
  process.exit(error ? 1 : 0);
});

// Timeout
setTimeout(() => {
  console.error('⏱️ Timeout - sin respuesta del servidor SMTP');
  process.exit(1);
}, 10000);
