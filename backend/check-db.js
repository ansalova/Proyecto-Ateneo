import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ 
  host: 'localhost', 
  port: 5432, 
  database: 'ateneo', 
  user: 'postgres' 
});

async function checkDB() {
  try {
    // Check tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tables in database:');
    tables.rows.forEach(t => console.log('  -', t.table_name));
    
    // Check users count
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('\nUsers in database:', users.rows[0].count);
    
    // Check version
    const version = await pool.query('SELECT version()');
    console.log('\nPostgreSQL version:', version.rows[0].version);
    
    await pool.end();
    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkDB();

