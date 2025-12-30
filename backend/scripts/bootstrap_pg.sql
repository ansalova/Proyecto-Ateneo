DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'Ateneo') THEN
    CREATE ROLE "Ateneo" LOGIN PASSWORD '1234567';
  END IF;
END $$;

SELECT 'CREATE DATABASE ateneo OWNER "Ateneo"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ateneo');
\gexec

ALTER DATABASE ateneo OWNER TO "Ateneo";
GRANT ALL PRIVILEGES ON DATABASE ateneo TO "Ateneo";
ALTER SCHEMA public OWNER TO "Ateneo";
GRANT USAGE, CREATE ON SCHEMA public TO "Ateneo";
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
