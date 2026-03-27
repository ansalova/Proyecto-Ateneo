import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/ateneo_db';

const pool = new Pool({
  connectionString,
});

async function migrate() {
  try {
    console.log('🐘 Conectando a PostgreSQL para agregar columna "phone"...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
    console.log('✅ Columna "phone" verificada/agregada exitosamente en la tabla "users".');
  } catch (err) {
    console.error('❌ Error ejecutando la migración:', err.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

migrate();