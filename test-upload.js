import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Crear un archivo de prueba
const testFilePath = path.join(__dirname, 'test-document.txt');
fs.writeFileSync(testFilePath, 'Este es un documento de prueba para verificar el upload\n');

console.log('📄 Archivo de prueba creado:', testFilePath);

// Obtener token (necesitarías cambiar esto)
const token = 'your-jwt-token-here';

// Preparar FormData
const form = new FormData();
form.append('title', 'Documento de Prueba');
form.append('document_type', 'otro');
form.append('is_public', 'true');
form.append('file', fs.createReadStream(testFilePath));

console.log('\n📤 Enviando GET /api/documents para ver documentos actuales...\n');

// Primero obtener documentos
fetch('http://localhost:5000/api/documents', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Documentos actuales:', data);
    console.log('\n📤 Intentando agregar nuevo documento...\n');
    
    // Luego intentar crear un documento con archivo
    return fetch('http://localhost:5000/api/documents', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Respuesta del servidor:', data);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  })
  .finally(() => {
    // Limpiar archivo de prueba
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n🧹 Archivo de prueba eliminado');
    }
  });
