import express from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getUnreadCount, markAnnouncementAsRead } from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todos pueden ver anuncios
router.get('/', getAnnouncements);

// Obtener cantidad de anuncios sin leer
router.get('/new-count', protect, getUnreadCount);

// Marcar anuncio como leído
router.post('/:id/mark-read', protect, markAnnouncementAsRead);

// Admin y profesores pueden crear anuncios
router.post('/', protect, authorize('admin', 'teacher'), createAnnouncement);

// Solo el autor o admin pueden editar
router.put('/:id', protect, authorize('admin', 'teacher'), updateAnnouncement);

// Solo el autor o admin pueden eliminar
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteAnnouncement);

export default router;
