import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

db.all("PRAGMA table_info(server)", function(err, rows) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Server table schema:', JSON.stringify(rows, null, 2));
  }
  db.close();
});


