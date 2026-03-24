import { getPool } from '../config/db.js';

async function cleanDocuments() {
  try {
    const pool = getPool();
    if (!pool) {
      console.error('❌ Base de datos no configurada');
      process.exit(1);
    }

    console.log('🧹 Limpiando documentos...');
    
    // Eliminar todos los documentos porque tienen is_public mal guardado
    const deleteResult = await pool.query('DELETE FROM documents WHERE 1=1');
    console.log('✅ Documentos eliminados:', deleteResult.rowCount);
    
    console.log('✅ Limpieza completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanDocuments();
