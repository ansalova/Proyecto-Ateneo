import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('C:/Users/pc/AppData/Roaming/pgAdmin/pgadmin4.db');

// Get the first user_id from the user table
db.get("SELECT id FROM user LIMIT 1", function(err, row) {
  if (err || !row) {
    console.log('Error getting user:', err ? err.message : 'No user found');
    db.close();
    return;
  }
  
  const userId = row.id;
  console.log('Using user_id:', userId);
  
  // Insert the new server
  db.run(`
    INSERT INTO server (user_id, servergroup_id, name, host, port, maintenance_db, username, save_password)
    VALUES (?, 1, 'Ateneo', 'localhost', 5432, 'ateneo', 'postgres', 0)
  `, [userId], function(err) {
    if (err) {
      console.log('Error:', err.message);
    } else {
      console.log('✅ Servidor "Ateneo" agregado exitosamente!');
      console.log('Cierra y vuelve a abrir pgAdmin4 para ver el servidor.');
    }
    db.close();
  });
});


