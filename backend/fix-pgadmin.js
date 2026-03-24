import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

db.run("UPDATE server SET password = '1234', save_password = 1 WHERE id IN (1, 2)", function(err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Password updated successfully for both servers!');
  }
  db.close();
});

