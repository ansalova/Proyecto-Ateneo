const { getPool } = await import('./config/db.js');
const pool = getPool();
if (!pool) throw new Error('DB_NOT_CONFIGURED');

(async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);
    await pool.query(`UPDATE users SET created_at = NOW() WHERE created_at IS NULL`);
    console.log('✅ created_at added and backfilled');
  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    pool.end();
  }
})();

