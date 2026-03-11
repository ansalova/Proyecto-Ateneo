import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

// Set password to NULL and save_password to 0 so pgAdmin4 will ask for password
// Or we can use 'trust' authentication which doesn't require password
db.run("UPDATE server SET password = NULL, save_password = 0 WHERE id IN (1, 2)", function(err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Password reset successfully! pgAdmin4 will ask for password on next connection.');
    console.log('Since PostgreSQL uses "trust" authentication for local connections,');
    console.log('you can just press Enter when prompted for password.');
  }
  db.close();
});


