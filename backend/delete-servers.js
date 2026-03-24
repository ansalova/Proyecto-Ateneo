import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

// Delete all server configurations
db.run("DELETE FROM server", function(err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('All servers deleted from pgAdmin4!');
    console.log('You can now add a new server connection in pgAdmin4.');
    console.log('Since PostgreSQL uses "trust" authentication, you can leave password empty.');
  }
  db.close();
});


