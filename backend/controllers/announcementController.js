import { getPool } from '../config/db.js';

export const getAnnouncements = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const userId = req.user?.id;

    const { rows } = await pool.query(
      `SELECT a.id, a.title, a.content, a.created_at, a.updated_at, a.created_by,
              u.name as created_by_name,
              CASE WHEN ar.id IS NOT NULL THEN true ELSE false END as is_read
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = $1
       WHERE a.visible = true
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('getAnnouncements error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO announcements (title, content, created_by, visible)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [title, content, userId]
    );

    res.json({ success: true, announcement: rows[0] });
  } catch (error) {
    console.error('createAnnouncement error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { id } = req.params;
    const { title, content, visible } = req.body;
    const userId = req.user.id;

    // Verificar permisos (solo admin o autor)
    const checkRes = await pool.query(
      'SELECT created_by FROM announcements WHERE id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'announcement_not_found' });
    }

    if (checkRes.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const { rows } = await pool.query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           visible = COALESCE($3, visible),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, content, visible, id]
    );

    res.json({ success: true, announcement: rows[0] });
  } catch (error) {
    console.error('updateAnnouncement error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { id } = req.params;
    const userId = req.user.id;

    // Verificar permisos
    const checkRes = await pool.query(
      'SELECT created_by FROM announcements WHERE id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'announcement_not_found' });
    }

    if (checkRes.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'unauthorized' });
    }

    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteAnnouncement error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM announcements a
       WHERE a.visible = true
       AND NOT EXISTS (
         SELECT 1 FROM announcement_reads ar
         WHERE ar.announcement_id = a.id AND ar.user_id = $1
       )`,
      [userId]
    );

    res.json({ unread_count: parseInt(rows[0].unread_count) });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

export const markAnnouncementAsRead = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el anuncio existe
    const announcementRes = await pool.query(
      'SELECT id FROM announcements WHERE id = $1',
      [id]
    );

    if (announcementRes.rows.length === 0) {
      return res.status(404).json({ error: 'announcement_not_found' });
    }

    // Insertar o ignorar si ya existe
    await pool.query(
      `INSERT INTO announcement_reads (announcement_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (announcement_id, user_id) DO NOTHING`,
      [id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('markAnnouncementAsRead error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};
