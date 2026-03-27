import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== Verificación de Variables de Entorno ===');
console.log('PORT:', process.env.PORT || 'NO DEFINIDO');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NO DEFINIDO');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'NO DEFINIDO');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK (configurado)' : 'NO DEFINIDO');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NO DEFINIDO');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'NO DEFINIDO');
console.log('TEACHER_INVITE_CODE:', process.env.TEACHER_INVITE_CODE || 'NO DEFINIDO');
console.log('ADMIN_INVITE_CODE:', process.env.ADMIN_INVITE_CODE || 'NO DEFINIDO');
console.log('--- MAIL CONFIG ---');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NO DEFINIDO');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ OK (configurado)' : '❌ NO DEFINIDO');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NO DEFINIDO');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NO DEFINIDO');
console.log('===========================================');
