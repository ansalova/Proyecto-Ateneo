import express from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getUnreadCount, markAnnouncementAsRead, markAnnouncementsAsReadBatch } from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todos pueden ver anuncios
router.get('/', getAnnouncements);

// Obtener cantidad de anuncios sin leer
router.get('/new-count', protect, getUnreadCount);

// Marcar anuncio como leído (individual)
router.post('/:id/mark-read', protect, markAnnouncementAsRead);

// Marcar múltiples anuncios como leídos en batch
router.post('/mark-read-batch', protect, markAnnouncementsAsReadBatch);

// Admin y profesores pueden crear anuncios
router.post('/', protect, authorize('admin', 'teacher'), createAnnouncement);

// Solo el autor o admin pueden editar
router.put('/:id', protect, authorize('admin', 'teacher'), updateAnnouncement);

// Solo el autor o admin pueden eliminar
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteAnnouncement);

export default router;
