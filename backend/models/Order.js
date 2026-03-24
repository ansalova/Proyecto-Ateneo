import { getPool } from "../config/db.js";

export const createOrder = async ({ external_reference, method, amount, metadata }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");

  const { rows } = await pool.query(
    `INSERT INTO orders (external_reference, method, amount, metadata, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [external_reference, method, amount, metadata]
  );
  return rows[0];
};

export const findOrderByReference = async (external_reference) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");

  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE external_reference = $1 LIMIT 1`,
    [external_reference]
  );
  return rows[0];
};

export const updateOrderStatus = async (external_reference, status) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");

  const { rows } = await pool.query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE external_reference = $2 RETURNING *`,
    [status, external_reference]
  );
  return rows[0];
};
