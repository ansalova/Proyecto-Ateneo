import { getPool } from '../config/db.js';

export const getDocuments = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'admin' || userRole === 'teacher') {
      // Admins y teachers ven todos los documentos
      query = `SELECT d.id, d.title, d.document_type, d.student_id, d.file_url, 
                      d.created_by, d.created_at, d.is_public,
                      u.name as created_by_name, s.name as student_name
               FROM documents d
               LEFT JOIN users u ON d.created_by = u.id
               LEFT JOIN users s ON d.student_id = s.id
               ORDER BY d.created_at DESC
               LIMIT 100`;
      params = [];
    } else {
      // Estudiantes ven: sus propios documentos + todos los documentos públicos
      // Intentar múltiples formas de comparar is_public porque puede ser string o boolean
      query = `SELECT d.id, d.title, d.document_type, d.student_id, d.file_url,
                      d.created_by, d.created_at, d.is_public,
                      u.name as created_by_name, s.name as student_name
               FROM documents d
               LEFT JOIN users u ON d.created_by = u.id
               LEFT JOIN users s ON d.student_id = s.id
               WHERE (d.is_public = true OR CAST(d.is_public as TEXT) IN ('true', 't', '1')) OR d.student_id = $1
               ORDER BY d.created_at DESC`;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    
    if (userRole !== 'admin' && userRole !== 'teacher') {
      console.log(`📋 Estudiante ${userId} - Encontrados ${rows.length} documentos:`, rows.map(r => ({ id: r.id, title: r.title, is_public: r.is_public, student_id: r.student_id })));
    }
    
    res.json(rows);
  } catch (error) {
    console.error('getDocuments error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const createDocument = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    let { title, document_type, student_id, file_url, is_public } = req.body;
    const userId = req.user.id;
    const uploadedFile = req.file;

    // Convertir is_public de string a booleano si es necesario
    if (typeof is_public === 'string') {
      is_public = is_public === 'true';
    }

    console.log('🔧 createDocument - Recibidos:', { title, document_type, is_public, uploadedFile: uploadedFile ? uploadedFile.filename : 'NO' });

    if (!title || !document_type) {
      return res.status(400).json({ msg: 'Título y tipo de documento son requeridos' });
    }

    let finalFileUrl = file_url;

    // Si se subió un archivo, usar la URL del archivo subido
    if (uploadedFile) {
      console.log('✅ Archivo detectado:', uploadedFile.filename);
      finalFileUrl = `/uploads/${uploadedFile.filename}`;
    } else {
      console.log('⚠️ Sin archivo, usando file_url:', file_url);
    }

    // Validar que exista URL o archivo subido
    if (!finalFileUrl || !finalFileUrl.trim()) {
      return res.status(400).json({ msg: 'Debes proporcionar una URL o subir un archivo' });
    }

    // Validar que sea una URL válida si es URL (y no es una ruta local /uploads/)
    if (!finalFileUrl.startsWith('/uploads')) {
      try {
        new URL(finalFileUrl);
      } catch {
        return res.status(400).json({ msg: 'La URL no es válida' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO documents (title, document_type, student_id, file_url, file_content, created_by, is_public)
       VALUES ($1, $2, $3, $4, NULL, $5, $6)
       RETURNING *`,
      [title, document_type, student_id || null, finalFileUrl.trim(), userId, is_public === true]
    );
    
    console.log('💾 Documento guardado - ID:', rows[0]?.id, 'is_public en BD:', rows[0]?.is_public, 'tipo:', typeof rows[0]?.is_public);

    res.json({ msg: 'Documento creado exitosamente', success: true, document: rows[0] });
  } catch (error) {
    console.error('createDocument error:', error);
    res.status(500).json({ msg: 'Error al crear documento. Intenta de nuevo.' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'not_found' });
    }

    const doc = rows[0];

    // Validar permisos: el estudiante dueño, admin, teacher, o si es público
    if (
      doc.student_id !== userId &&
      userRole !== 'admin' &&
      userRole !== 'teacher' &&
      !doc.is_public
    ) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    res.json(doc);
  } catch (error) {
    console.error('getDocumentById error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar permisos
    const checkRes = await pool.query(
      'SELECT created_by FROM documents WHERE id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'not_found' });
    }

    if (checkRes.rows[0].created_by !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'unauthorized' });
    }

    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};
