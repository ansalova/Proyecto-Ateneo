import { getPool } from "../config/db.js";

export const findByEmail = async (email) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, password, role, document_type, document_number, verified FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return rows[0] || null;
};

export const createUser = async ({ name, email, password, role, document_type, document_number }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password, role, document_type, document_number, verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, document_type, document_number, verified",
    [name, email, password, role || "user", document_type || "cedula_ciudadania", document_number || null, false]
  );
  return rows[0];
};

export const findById = async (id) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, role, document_type, document_number FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

export const findStudents = async () => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "SELECT id, name, email, role, document_type, document_number FROM users WHERE role IN ('user','student') ORDER BY name ASC"
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

export const updatePassword = async (id, hashedPassword) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email",
    [hashedPassword, id]
  );
  return rows[0] || null;
};

// actualiza datos del usuario; si se proporciona password ya debe estar hasheada
export const updateUser = async (id, { name, email, document_type, document_number, password, verified }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");

  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }
  if (document_type !== undefined) {
    fields.push(`document_type = $${idx++}`);
    values.push(document_type);
  }
  if (document_number !== undefined) {
    fields.push(`document_number = $${idx++}`);
    values.push(document_number);
  }
  if (password !== undefined) {
    fields.push(`password = $${idx++}`);
    values.push(password);
  }
  if (verified !== undefined) {
    fields.push(`verified = $${idx++}`);
    values.push(verified);
  }

  if (fields.length === 0) {
    // nothing to update
    const { rows } = await pool.query(
      "SELECT id, name, email, role, document_type, document_number, verified FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  values.push(id); // last param
  const query = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING id, name, email, role, document_type, document_number, verified`;
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};
