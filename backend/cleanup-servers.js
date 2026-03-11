import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

// Delete the old server with corrupted password
db.run("DELETE FROM server WHERE id = 1", function(err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('✅ Servidor antiguo eliminado!');
  }
  db.close();
});


