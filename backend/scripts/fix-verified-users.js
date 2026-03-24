import 'dotenv/config';
import { getPool } from '../config/db.js';

async function fixUsers() {
  const pool = getPool();
  try {
    console.log('Iniciando actualización de usuarios...');
    const res = await pool.query('UPDATE users SET verified = true WHERE verified = false');
    console.log(`Usuarios actualizados: ${res.rowCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Error actualizando usuarios:', err);
    process.exit(1);
  }
}

fixUsers();
