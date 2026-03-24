import pg from 'pg';
const { Pool } = pg;

// Test connection using default credentials from the code
const connectionString = 'postgresql://postgres:1234@localhost/ateneo';

const pool = new Pool({
  connectionString,
});

async function testConnection() {
  console.log('🔄 Probando conexión a PostgreSQL...');
  console.log(`📡 Connection string: ${connectionString}`);
  
  try {
    // Test 1: Basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Conexión exitosa!');
    console.log(`⏰ Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`🗄️  Versión PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Test 2: Check databases
    const dbResult = await pool.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log('\n📊 Bases de datos disponibles:');
    dbResult.rows.forEach(row => {
      console.log(`   - ${row.datname}`);
    });
    
    // Test 3: Check tables in ateneo database
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas en la base de datos "ateneo":');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   (No hay tablas aún)');
    }
    
    // Test 4: Check users table
    try {
      const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Número de usuarios: ${usersCount.rows[0].count}`);
    } catch (e) {
      console.log('\n⚠️  Tabla "users" no existe o está vacía');
    }
    
    console.log('\n🎉 Todas las pruebas pasaron!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Solución: Verifica que PostgreSQL esté ejecutándose');
    } else if (error.message.includes('database "ateneo" does not exist')) {
      console.log('\n🔧 Solución: La base de datos "ateneo" no existe. Se creará automáticamente al iniciar el servidor.');
    }
  } finally {
    await pool.end();
  }
}

testConnection();

