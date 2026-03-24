import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost/ateneo'
});

async function updateUserFields() {
  try {
    console.log('📚 Actualizando campos de usuarios...\n');

    // Obtener todos los estudiantes/usuarios
    const result = await pool.query(
      `SELECT id, role FROM users WHERE role IN ('student', 'user') ORDER BY id ASC`
    );

    const users = result.rows;
    console.log(`Encontrados ${users.length} estudiantes\n`);

    // Definir grados disponibles
    const grades = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo', '11vo'];

    // Actualizar cada usuario
    for (const user of users) {
      const documentNumber = `100${String(user.id).padStart(6, '0')}`; // 100000001, 100000002, etc.
      const gradeIndex = (user.id - 1) % grades.length;
      const grade = grades[gradeIndex];

      await pool.query(
        `UPDATE users SET document_number = $1, grade = $2 WHERE id = $3`,
        [documentNumber, grade, user.id]
      );

      console.log(`✅ Usuario ID ${user.id}: documento=${documentNumber}, grado=${grade}`);
    }

    console.log('\n✅ Actualización completada exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateUserFields();
