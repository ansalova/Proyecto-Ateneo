import express from 'express';
import { getDocuments, createDocument, getDocumentById, deleteDocument } from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Obtener documentos (filtrado por rol/usuario)
router.get('/', protect, (req, res, next) => {
  console.log('📥 GET /api/documents - Usuario:', req.user?.id, 'Rol:', req.user?.role);
  next();
}, getDocuments);

// Obtener un documento específico
router.get('/:id', protect, getDocumentById);

// Crear documento (admin/teacher) - con o sin archivo
router.post('/', protect, (req, res, next) => {
  console.log('📨 POST /api/documents recibido');
  console.log('  Usuario ID:', req.user?.id);
  console.log('  Rol:', req.user?.role);
  console.log('  Content-Type:', req.get('content-type'));
  next();
}, authorize('admin', 'teacher'), (req, res, next) => {
  console.log('✅ Usuario autorizado, iniciando upload...');
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Error en multer:', err.message);
      return res.status(400).json({ msg: `Error en upload: ${err.message}` });
    }
    console.log('✅ Upload completado');
    console.log('  Archivo:', req.file ? { name: req.file.filename, size: req.file.size } : 'NO ARCHIVO');
    console.log('  Body:', req.body);
    next();
  });
}, createDocument);

// Eliminar documento
router.delete('/:id', protect, deleteDocument);

export default router;
