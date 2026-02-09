import express from 'express';
import { getDocuments, createDocument, getDocumentById, deleteDocument } from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener documentos (filtrado por rol/usuario)
router.get('/', protect, getDocuments);

// Obtener un documento específico
router.get('/:id', protect, getDocumentById);

// Crear documento (admin/teacher)
router.post('/', protect, authorize('admin', 'teacher'), createDocument);

// Eliminar documento
router.delete('/:id', protect, deleteDocument);

export default router;
