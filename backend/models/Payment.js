import { getPool } from "../config/db.js";

export const createPayment = async ({ order_id, provider, preference_id, mp_payment_id, status, raw_response }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "INSERT INTO payments (order_id, provider, preference_id, mp_payment_id, status, raw_response) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [order_id, provider, preference_id || null, mp_payment_id || null, status || "initiated", raw_response ? JSON.stringify(raw_response) : null]
  );
  return rows[0];
};

export const updatePaymentStatus = async ({ id, status, raw_response }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "UPDATE payments SET status = $2, raw_response = COALESCE($3, raw_response), updated_at = NOW() WHERE id = $1 RETURNING *",
    [id, status, raw_response ? JSON.stringify(raw_response) : null]
  );
  return rows[0];
};

export const listPaymentsByOrder = async (order_id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, order_id, provider, preference_id, mp_payment_id, status, raw_response, created_at, updated_at FROM payments WHERE order_id = $1 ORDER BY created_at DESC",
    [order_id]
  );
  return rows;
};

export const findPaymentByMpId = async (mp_payment_id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT * FROM payments WHERE mp_payment_id = $1 LIMIT 1",
    [mp_payment_id]
  );
  return rows[0] || null;
};
