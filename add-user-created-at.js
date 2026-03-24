import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/ateneo_db' });

async function addCreatedAt() {
  try {
    const result = await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
      SELECT 'Columna created_at agregada y backfilled.' as message;
    `);
    console.log('✅ Result:', result.rows[0]?.message || 'OK');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

addCreatedAt();

