import { Pool, Client } from "pg";

let pool = null;

// Función para crear la BD si no existe
const ensureDbExists = async (connectionString) => {
  try {
    // Parsear la URL para extraer datos y conectar a la BD 'postgres' por defecto
    const url = new URL(connectionString);
    const dbName = url.pathname.split('/')[1]; // 'ateneo'
    
    // Conectamos a 'postgres' para verificar existencia de 'ateneo'
    url.pathname = '/postgres'; 
    
    const client = new Client({
      connectionString: url.toString(),
      ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

    await client.connect();
    
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Base de datos '${dbName}' no existe. Creándola...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`Base de datos '${dbName}' ya existe.`);
    }
    
    await client.end();
  } catch (err) {
    console.error("Error verificando base de datos inicial (puede ignorarse si la BD ya existe y la conexión es directa):", err.message);
  }
};

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
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.PG_CONNECTION_STRING;

    if (connectionString) {
      await ensureDbExists(connectionString);
    }

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
        document_type VARCHAR(50) DEFAULT 'cedula_ciudadania',
        document_number VARCHAR(50),
        verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Agregar columna verified si no existe
    await p.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
    `);

    // Agregar columna document_type si no existe (para usuarios existentes)
    await p.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) DEFAULT 'cedula_ciudadania';
    `);

    // Agregar columna document_number si no existe (para usuarios existentes)
    await p.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS document_number VARCHAR(50);
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        external_reference VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        method VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(120),
        grade DECIMAL(3, 1),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await p.query(`ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_id_key;`);
    await p.query(`ALTER TABLE grades ADD COLUMN IF NOT EXISTS period VARCHAR(20);`);
    await p.query(`ALTER TABLE grades ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);`);
    await p.query(`ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_subject_period_unique;`);
    await p.query(`ALTER TABLE grades ADD CONSTRAINT grades_student_subject_period_unique UNIQUE (student_id, subject, period);`);
    await p.query(`
      CREATE TABLE IF NOT EXISTS grade_history (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(120) NOT NULL,
        period VARCHAR(20) NOT NULL,
        old_grade DECIMAL(3,1),
        new_grade DECIMAL(3,1) NOT NULL,
        changed_by INTEGER REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        file_url VARCHAR(500),
        file_content TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT false
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(announcement_id, user_id)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await p.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'nuevo',
        response TEXT,
        responded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await p.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
    `);
    console.log("PostgreSQL conectado y tablas verificadas");
  } catch (error) {
    console.error("Error al conectar PostgreSQL:", error);
  }
};

export default connectDB;
