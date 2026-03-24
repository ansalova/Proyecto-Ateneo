import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost/ateneo'
});

async function revertUserFields() {
  try {
    console.log('🔄 Revirtiendo datos (dejando NULL)...\n');

    // Revertir todos a NULL
    await pool.query(
      `UPDATE users SET document_number = NULL, grade = NULL WHERE role IN ('student', 'user')`
    );

    console.log('✅ Revertido: todos los document_number y grade están ahora NULL');
    console.log('   Los usuarios deben completar su perfil con su información real.\n');

    // Mostrar usuarios actuales
    const result = await pool.query(
      `SELECT id, name, email, document_number, grade, role FROM users WHERE role IN ('student', 'user') LIMIT 5`
    );

    console.log('📊 Primeros 5 usuarios:');
    result.rows.forEach(user => {
      console.log(`  ID ${user.id}: ${user.name} | Doc: ${user.document_number || 'NULL'} | Grade: ${user.grade || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

revertUserFields();
