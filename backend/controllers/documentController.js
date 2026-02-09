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
      // Admins y teachers ven todos los documentos, estudiantes solo los suyos
      query = `SELECT id, title, document_type, student_id, file_url, 
                      created_by, created_at, is_public,
                      u.name as created_by_name, s.name as student_name
               FROM documents d
               LEFT JOIN users u ON d.created_by = u.id
               LEFT JOIN users s ON d.student_id = s.id
               ORDER BY d.created_at DESC
               LIMIT 100`;
      params = [];
    } else {
      // Estudiantes solo ven sus propios documentos
      query = `SELECT id, title, document_type, student_id, file_url,
                      created_by, created_at, is_public,
                      u.name as created_by_name
               FROM documents d
               LEFT JOIN users u ON d.created_by = u.id
               WHERE d.student_id = $1
               ORDER BY d.created_at DESC`;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
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

    const { title, document_type, student_id, file_url, file_content, is_public } = req.body;
    const userId = req.user.id;

    if (!title || !document_type) {
      return res.status(400).json({ error: 'title and document_type required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO documents (title, document_type, student_id, file_url, file_content, created_by, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, document_type, student_id || null, file_url, file_content, userId, is_public || false]
    );

    res.json({ success: true, document: rows[0] });
  } catch (error) {
    console.error('createDocument error:', error);
    res.status(500).json({ error: 'internal_error' });
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
