import { getPool } from '../config/db.js';

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    // Obtener estadísticas generales
    const stats = {};

    // Total de usuarios por rol
    const users = await pool.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    stats.usersByRole = users.rows.reduce((acc, row) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    }, {});

    // Total de ordenes
    const orders = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
              status, COUNT(*) as count
       FROM orders
       GROUP BY status`
    );
    stats.orders = {
      total: parseInt(orders.rows.reduce((sum, row) => sum + parseInt(row.count), 0)),
      totalAmount: orders.rows.reduce((sum, row) => sum + (parseFloat(row.total_amount) || 0), 0),
      byStatus: orders.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      }))
    };

    // Anuncios totales
    const announcements = await pool.query(
      `SELECT COUNT(*) as total FROM announcements WHERE visible = true`
    );
    stats.announcements = parseInt(announcements.rows[0].total);

    // Documentos totales
    const documents = await pool.query(
      `SELECT COUNT(*) as total FROM documents`
    );
    stats.documents = parseInt(documents.rows[0].total);

    // Últimos pagos
    const recentPayments = await pool.query(
      `SELECT o.id, o.external_reference, o.amount, o.status, o.created_at, o.method,
              u.name, u.email
       FROM orders o
       LEFT JOIN users u ON o.metadata->>'user_id' = u.id::text
       ORDER BY o.created_at DESC
       LIMIT 10`
    );
    stats.recentPayments = recentPayments.rows;

    res.json(stats);
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'internal_error', message: error.message });
  }
};

// obtener reporte de pagos detallado
export const getPaymentReport = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { startDate, endDate, status } = req.query;

    let query = `
      SELECT o.id, o.external_reference, o.amount, o.status, o.method,
             o.created_at, o.updated_at, o.metadata,
             u.id as user_id, u.name, u.email, u.document_number, u.role, u.grade
      FROM orders o
      LEFT JOIN users u ON CAST(o.metadata->>'user_id' AS INTEGER) = u.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      params.push(new Date(startDate));
      query += ` AND o.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(new Date(endDate));
      query += ` AND o.created_at <= $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);

    // Debug: log primer registro para ver qué datos llegamos
    if (result.rows.length > 0) {
      console.log('\n=== 📊 PAYMENT DATA DEBUG ===');
      console.log('Total payments:', result.rows.length);
      console.log('\n--- CHECKING JOINS ---');
      const joinedCount = result.rows.filter(r => r.user_id !== null).length;
      const nullCount = result.rows.length - joinedCount;
      console.log('✅ Successful JOINs (user_id found):', joinedCount);
      console.log('❌ Failed JOINs (user_id is NULL):', nullCount);
      
      console.log('\nFirst 3 records:');
      result.rows.slice(0, 3).forEach((row, idx) => {
        console.log(`\n  Payment ${idx + 1}:`);
        console.log(`    external_reference: ${row.external_reference}`);
        console.log(`    metadata.user_id: ${row.metadata?.user_id || 'N/A'}`);
        console.log(`    ↓ JOIN result:`);
        console.log(`    user_id (from users table): ${row.user_id}`);
        console.log(`    name: ${row.name}`);
        console.log(`    email: ${row.email}`);
        console.log(`    document_number: ${row.document_number}`);
        console.log(`    grade: ${row.grade}`);
        console.log(`    role: ${row.role}`);
      });
      console.log('\n=== END DEBUG ===\n');
    }

    // Calcular resumen
    const summary = {
      total: result.rows.length,
      totalAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0),
      byStatus: {},
      byMethod: {}
    };

    result.rows.forEach(row => {
      summary.byStatus[row.status] = (summary.byStatus[row.status] || 0) + 1;
      summary.byMethod[row.method] = (summary.byMethod[row.method] || 0) + 1;
    });

    res.json({ summary, payments: result.rows });
  } catch (error) {
    console.error('getPaymentReport error:', error);
    res.status(500).json({ error: 'internal_error', message: error.message });
  }
};

// Obtener lista de usuarios con filtros
export const getUsersList = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { role, search } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.metadata->>'user_id'::integer
      WHERE 1=1
    `;

    const params = [];

    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('getUsersList error:', error);
    res.status(500).json({ error: 'internal_error', message: error.message });
  }
};

// Crear admin manualmente (solo acceso via DB o ruta protegida)
export const makeUserAdmin = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const { userId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'unauthorized' });
    }

    await pool.query(
      `UPDATE users SET role = 'admin' WHERE id = $1`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('makeUserAdmin error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

// Obtener resumen de actividad (últimos 30 días)
export const getActivitySummary = async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) throw new Error('DB_NOT_CONFIGURED');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Usuarios nuevos
    const newUsers = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) DESC`,
      [thirtyDaysAgo]
    );

    // Pagos por día
    const paymentsByDay = await pool.query(
      `SELECT DATE(created_at) as date, 
              COUNT(*) as count,
              SUM(amount) as total
       FROM orders
       WHERE created_at >= $1 AND status = 'completed'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) DESC`,
      [thirtyDaysAgo]
    );

    res.json({
      newUsers: newUsers.rows,
      paymentsByDay: paymentsByDay.rows
    });
  } catch (error) {
    console.error('getActivitySummary error:', error);
    res.status(500).json({ error: 'internal_error' });
  }
};
