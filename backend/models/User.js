import { getPool } from "../config/db.js";

export const findByEmail = async (email) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return rows[0] || null;
};

export const createUser = async ({ name, email, password, role }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, email, password, role || "user"]
  );
  return rows[0];
};

export const findById = async (id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, role, password FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

export const findStudents = async () => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, role FROM users WHERE role IN ('user','student') ORDER BY name ASC"
  );
  return rows;
};

export const updateUserPassword = async ({ id, password }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, role",
    [id, password]
  );
  return rows[0] || null;
};

export const createPasswordReset = async ({ user_id, token, expires_at }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *",
    [user_id, token, expires_at]
  );
  return rows[0];
};

export const findValidPasswordReset = async (token) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT pr.*, u.email FROM password_resets pr JOIN users u ON u.id = pr.user_id WHERE token = $1 AND used = FALSE AND expires_at > NOW() LIMIT 1",
    [token]
  );
  return rows[0] || null;
};

export const consumePasswordReset = async (token) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  await pool.query(
    "UPDATE password_resets SET used = TRUE, expires_at = NOW() WHERE token = $1",
    [token]
  );
};
