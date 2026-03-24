import { getPool } from '../config/db.js'

// Enviar mensaje de contacto (público, sin autenticación)
export const submitContact = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: 'Nombre, email, asunto y mensaje requeridos' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Email inválido' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ msg: 'Mensaje demasiado largo (máx 2000 caracteres)' })
    }

    const { rows } = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'nuevo')
       RETURNING *`,
      [name, email, phone || null, subject, message]
    )

    res.json({ 
      msg: 'Mensaje de contacto enviado. Pronto nos pondremos en contacto',
      id: rows[0].id 
    })
  } catch (error) {
    console.error('submitContact error:', error)
    res.status(500).json({ msg: 'Error al enviar mensaje de contacto' })
  }
}

// Obtener contactos (solo admin)
export const getContactSubmissions = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { status = 'nuevo' } = req.query

    let query = 'SELECT * FROM contact_submissions'
    let params = []

    if (status && status !== 'todos') {
      query += ' WHERE status = $1'
      params = [status]
    }

    query += ' ORDER BY created_at DESC LIMIT 100'

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    console.error('getContactSubmissions error:', error)
    res.status(500).json({ msg: 'Error al cargar contactos' })
  }
}

// Responder contacto (solo admin)
export const respondContact = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { id } = req.params
    const { response } = req.body
    const adminId = req.user.id

    if (!response) {
      return res.status(400).json({ msg: 'Respuesta requerida' })
    }

    const { rows } = await pool.query(
      `UPDATE contact_submissions 
       SET response = $1, responded_by = $2, status = 'respondido', updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [response, adminId, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Contacto no encontrado' })
    }

    // TODO: Aquí iría el envío de email con la respuesta
    res.json({ msg: 'Respuesta enviada', contact: rows[0] })
  } catch (error) {
    console.error('respondContact error:', error)
    res.status(500).json({ msg: 'Error al responder' })
  }
}

// Cambiar estado del contacto
export const updateContactStatus = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { id } = req.params
    const { status } = req.body

    if (!['nuevo', 'en_progreso', 'respondido', 'cerrado'].includes(status)) {
      return res.status(400).json({ msg: 'Estado inválido' })
    }

    const { rows } = await pool.query(
      `UPDATE contact_submissions 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Contacto no encontrado' })
    }

    res.json({ msg: 'Estado actualizado', contact: rows[0] })
  } catch (error) {
    console.error('updateContactStatus error:', error)
    res.status(500).json({ msg: 'Error al actualizar estado' })
  }
}

// Eliminar contacto
export const deleteContact = async (req, res) => {
  try {
    const pool = getPool()
    if (!pool) throw new Error('DB_NOT_CONFIGURED')

    const { id } = req.params

    await pool.query('DELETE FROM contact_submissions WHERE id = $1', [id])
    res.json({ msg: 'Contacto eliminado' })
  } catch (error) {
    console.error('deleteContact error:', error)
    res.status(500).json({ msg: 'Error al eliminar contacto' })
  }
}
