import { getPool } from "../config/db.js";

export const findGrade = async ({ studentId, subject, period }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    `SELECT id, student_id, subject, period, grade, updated_by, updated_at
     FROM grades WHERE student_id = $1 AND subject = $2 AND period = $3 LIMIT 1`,
    [studentId, subject, period]
  );
  return rows[0] || null;
};

export const upsertGrade = async ({ studentId, subject, period, grade, updatedBy }) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const existing = await findGrade({ studentId, subject, period });
  const { rows } = await pool.query(
    `INSERT INTO grades (student_id, subject, period, grade, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (student_id, subject, period)
     DO UPDATE SET grade = EXCLUDED.grade, updated_by = EXCLUDED.updated_by, updated_at = NOW()
     RETURNING id, student_id, subject, period, grade, updated_by, updated_at`,
    [studentId, subject, period, grade, updatedBy]
  );
  const saved = rows[0];
  if (existing && existing.grade !== saved.grade) {
    await pool.query(
      `INSERT INTO grade_history (student_id, subject, period, old_grade, new_grade, changed_by, changed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [studentId, subject, period, existing.grade, saved.grade, updatedBy]
    );
  } else if (!existing) {
    await pool.query(
      `INSERT INTO grade_history (student_id, subject, period, old_grade, new_grade, changed_by, changed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [studentId, subject, period, null, saved.grade, updatedBy]
    );
  }
  return saved;
};

export const getGradesForStudents = async () => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    `SELECT u.id AS student_id, u.name, u.email,
            g.subject, g.period, g.grade,
            g.updated_by, g.updated_at,
            ub.name AS updated_by_name
     FROM users u
     LEFT JOIN grades g ON g.student_id = u.id
     LEFT JOIN users ub ON ub.id = g.updated_by
     WHERE u.role IN ('user','student')
     ORDER BY u.id ASC, g.subject ASC NULLS LAST, g.period ASC NULLS LAST`
  );
  return rows;
};

export const getGradeHistoryForStudent = async (studentId) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    `SELECT h.student_id, u.name AS student_name, h.subject, h.period,
            h.old_grade, h.new_grade, h.changed_at,
            ub.name AS changed_by_name
     FROM grade_history h
     LEFT JOIN users u ON u.id = h.student_id
     LEFT JOIN users ub ON ub.id = h.changed_by
     WHERE h.student_id = $1
     ORDER BY h.changed_at DESC`,
    [studentId]
  );
  return rows;
};

export const getGradesForStudent = async (studentId) => {
  const pool = getPool();
  if (!pool) throw new Error("DB_NOT_CONFIGURED");
  const { rows } = await pool.query(
    `SELECT subject, period, grade, updated_at
     FROM grades
     WHERE student_id = $1
     ORDER BY subject ASC, period ASC`,
    [studentId]
  );
  return rows;
};
