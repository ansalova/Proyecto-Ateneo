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
    "SELECT id, name, email, role FROM users WHERE id = $1 LIMIT 1",
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

export const countAdmins = async () => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'"
  );
  return rows[0]?.count ?? 0;
};
