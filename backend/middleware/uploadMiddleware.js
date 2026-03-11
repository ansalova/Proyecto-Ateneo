import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpeta si no existe
// La carpeta uploads está en backend/public/uploads (subir 2 niveles desde middleware)
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
console.log('🔧 uploadMiddleware - uploadsDir calculado:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Carpeta de uploads creada:', uploadsDir);
} else {
  console.log('📁 Carpeta de uploads existente:', uploadsDir);
}

// Verificar permisos de escritura
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log('✅ Carpeta de uploads tiene permisos de escritura');
} catch (err) {
  console.error('❌ ERROR: No hay permisos de escritura en:', uploadsDir);
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📤 destination() llamado para archivo:', file.originalname);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalName = uniqueSuffix + path.extname(file.originalname);
    console.log('📝 filename generado:', finalName);
    cb(null, finalName);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  console.log('🔍 fileFilter() - Verificando archivo:', file.originalname, 'MIME:', file.mimetype);
  
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ Archivo permitido');
    cb(null, true);
  } else {
    console.log('❌ Archivo NO permitido');
    cb(new Error('Tipo de archivo no permitido. Solo: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT'), false);
  }
};

// Crear middleware multer
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware para manejar errores de multer
export const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE' || error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ msg: 'El archivo es demasiado grande. Máximo 5 MB.' });
    }
  }
  
  if (error && error.message) {
    return res.status(400).json({ msg: error.message });
  }
  
  next();
};

export { uploadsDir };
