
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Parse connection string or use env vars
const connectionString = process.env.DATABASE_URL;

// We need to extract the base connection info to connect to 'postgres' db first
// Format: postgres://user:password@host:port/dbname
const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!match) {
  console.error("❌ Formato de DATABASE_URL incorrecto. Debe ser: postgres://user:password@host:port/dbname");
  process.exit(1);
}

const [, user, password, host, port, dbName] = match;

async function setupDatabase() {
  console.log(`🔌 Intentando conectar a PostgreSQL como usuario '${user}'...`);

  // 1. Connect to default 'postgres' database to check/create the target db
  const client = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres', // Always exists
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log("✅ Conexión exitosa con el servidor PostgreSQL.");

    // 2. Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      console.log(`✨ La base de datos '${dbName}' no existe. Creándola...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`ℹ️ La base de datos '${dbName}' ya existe.`);
    }

    await client.end();
    console.log("🎉 Configuración de base de datos completada.");

  } catch (err) {
    if (err.code === '28P01') {
      console.error("\n❌ ERROR DE AUTENTICACIÓN:");
      console.error(`   La contraseña para el usuario '${user}' es incorrecta.`);
      console.error("   -> Por favor verifica la contraseña en tu archivo backend/.env");
    } else {
      console.error("\n❌ Error al conectar o crear la base de datos:", err.message);
    }
    process.exit(1);
  }
}

setupDatabase();
