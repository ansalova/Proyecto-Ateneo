import { Pool } from "pg";

let pool = null;

export const getPool = () => {
  if (pool) return pool;
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PG_CONNECTION_STRING;

  if (!connectionString) {
    console.warn(
      "POSTGRES no configurado. Define DATABASE_URL/POSTGRES_URL/PG_CONNECTION_STRING en el .env"
    );
  }

  pool = new Pool({
    connectionString,
    ssl:
      process.env.PG_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  return pool;
};

const connectDB = async () => {
  try {
    const p = getPool();
    if (!p) {
      console.warn("Pool de Postgres no inicializado");
      return;
    }
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("PostgreSQL conectado y tabla users verificada");
  } catch (error) {
    console.error("Error al conectar PostgreSQL:", error);
  }
};

export default connectDB;
