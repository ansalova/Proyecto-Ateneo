import { getPool } from '../config/db.js'

// Obtener mensajes (inbox del usuario)
export const getMessages = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const userId = req.user.id
    const { folder = 'inbox' } = req.query

    let query
    if (folder === 'inbox') {
      query = `
        SELECT m.*, 
               u.name as sender_name, u.email as sender_email
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_id = $1
        ORDER BY m.created_at DESC
        LIMIT 100
      `
    } else if (folder === 'sent') {
      query = `
        SELECT m.*,
               u.name as recipient_name, u.email as recipient_email
        FROM messages m
        LEFT JOIN users u ON m.recipient_id = u.id
        WHERE m.sender_id = $1
        ORDER BY m.created_at DESC
        LIMIT 100
      `
    }

    const { rows } = await pool.query(query, [userId])
    res.json(rows)
  } catch (error) {
    console.error('getMessages error:', error)
    res.status(500).json({ msg: 'Error al cargar mensajes' })
  }
}

// Enviar mensaje
export const sendMessage = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const senderId = req.user.id
    const { recipientId, subject, content } = req.body

    if (!recipientId || !content) {
      return res.status(400).json({ msg: 'Destinatario y contenido requeridos' })
    }

    if (content.length > 5000) {
      return res.status(400).json({ msg: 'Mensaje demasiado largo (máx 5000 caracteres)' })
    }

    // Verificar que el destinatario existe
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [recipientId]
    )
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario destinatario no encontrado' })
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, recipientId, subject || 'Sin asunto', content]
    )

    res.json({ msg: 'Mensaje enviado', message: rows[0] })
  } catch (error) {
    console.error('sendMessage error:', error)
    res.status(500).json({ msg: 'Error al enviar mensaje' })
  }
}

// Marcar mensaje como leído
export const markAsRead = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { id } = req.params
    const userId = req.user.id

    // Verificar que es el destinatario
    const msgCheck = await pool.query(
      'SELECT recipient_id FROM messages WHERE id = $1',
      [id]
    )
    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' })
    }
    if (msgCheck.rows[0].recipient_id !== userId) {
      return res.status(403).json({ msg: 'No autorizado' })
    }

    await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1',
      [id]
    )

    res.json({ msg: 'Mensaje marcado como leído' })
  } catch (error) {
    console.error('markAsRead error:', error)
    res.status(500).json({ msg: 'Error al marcar mensaje' })
  }
}

// Obtener contador de mensajes no leídos
export const getUnreadCount = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const userId = req.user.id
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false',
      [userId]
    )

    res.json({ unread_count: parseInt(rows[0].count) })
  } catch (error) {
    console.error('getUnreadCount error:', error)
    res.status(500).json({ msg: 'Error al contar mensajes' })
  }
}

// Eliminar mensaje
export const deleteMessage = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { id } = req.params
    const userId = req.user.id

    // Verificar que es el propietario del mensaje
    const msgCheck = await pool.query(
      'SELECT sender_id, recipient_id FROM messages WHERE id = $1',
      [id]
    )
    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Mensaje no encontrado' })
    }
    const msg = msgCheck.rows[0]
    if (msg.sender_id !== userId && msg.recipient_id !== userId) {
      return res.status(403).json({ msg: 'No autorizado' })
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [id])
    res.json({ msg: 'Mensaje eliminado' })
  } catch (error) {
    console.error('deleteMessage error:', error)
    res.status(500).json({ msg: 'Error al eliminar mensaje' })
  }
}

// Obtener lista de usuarios disponibles (para enviar mensajes)
export const getAvailableUsers = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const userId = req.user.id
    const { search = '' } = req.query

    let query = `
      SELECT id, name, email, role
      FROM users
      WHERE id != $1
    `
    const params = [userId]

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`
    }

    query += ` ORDER BY name ASC LIMIT 50`

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    console.error('getAvailableUsers error:', error)
    res.status(500).json({ msg: 'Error al cargar usuarios' })
  }
}
