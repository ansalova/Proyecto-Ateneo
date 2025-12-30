import { getPool } from "../config/db.js";

export const createOrder = async ({ external_reference, user_id, amount, method, status, metadata }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "INSERT INTO orders (external_reference, user_id, amount, method, status, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [external_reference, user_id || null, amount, method, status || "pending", metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0];
};

export const addOrderItems = async (orderId, items = []) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  for (const i of items) {
    await pool.query(
      "INSERT INTO order_items (order_id, item_id, title, qty, unit_price, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
      [orderId, String(i.id ?? "mensualidad"), String(i.title ?? i.name ?? "Mensualidad Ateneo"), Number(i.quantity ?? i.qty ?? 1), Number(i.unit_price ?? i.price ?? 0), i.metadata ? JSON.stringify(i.metadata) : null]
    );
  }
};

export const findOrderByReference = async (external_reference) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query("SELECT * FROM orders WHERE external_reference = $1 LIMIT 1", [external_reference]);
  return rows[0] || null;
};

export const listOrdersByUser = async (user_id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

export const listOrderItems = async (order_id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, order_id, item_id, title, qty, unit_price, metadata, created_at FROM order_items WHERE order_id = $1 ORDER BY id ASC",
    [order_id]
  );
  return rows;
};

export const updateOrderStatus = async ({ id, status }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
    [id, status]
  );
  return rows[0];
};
