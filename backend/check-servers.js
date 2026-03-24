import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

db.all("SELECT id, name, host, port, username, save_password FROM server", function(err, rows) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Servers in pgAdmin4:', JSON.stringify(rows, null, 2));
  }
  db.close();
});


