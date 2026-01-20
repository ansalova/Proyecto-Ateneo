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
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        external_reference VARCHAR(120) UNIQUE NOT NULL,
        user_id INTEGER,
        amount INTEGER NOT NULL,
        method VARCHAR(40) NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'pending',
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_orders_external_reference ON orders(external_reference);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        item_id VARCHAR(80),
        title VARCHAR(200) NOT NULL,
        qty INTEGER NOT NULL DEFAULT 1,
        unit_price INTEGER NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        provider VARCHAR(80) NOT NULL,
        preference_id VARCHAR(120),
        mp_payment_id VARCHAR(120),
        status VARCHAR(40) NOT NULL DEFAULT 'initiated',
        raw_response JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(200) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
    `);
    console.log("PostgreSQL conectado y tablas verificadas");
  } catch (error) {
    console.error("Error al conectar PostgreSQL:", error);
  }
};

export default connectDB;
