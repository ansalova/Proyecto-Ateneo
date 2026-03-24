import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

// Insert a new server configuration
const serverName = 'Ateneo';
const host = 'localhost';
const port = '5432';
const username = 'postgres';
const dbName = 'ateneo';

db.run(`
  INSERT INTO server (servergroup_id, name, host, port, maintenance_db, username, ssl_mode, save_password)
  VALUES (1, ?, ?, ?, ?, ?, 'prefer', 0)
`, [serverName, host, port, dbName, username], function(err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('✅ Servidor "Ateneo" agregado exitosamente a pgAdmin4!');
    console.log('Cierra y vuelve a abrir pgAdmin4 para ver el servidor.');
  }
  db.close();
});


