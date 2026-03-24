import express from 'express'
import { protect, authorize } from '../middleware/authMiddleware.js'
import * as contactController from '../controllers/contactController.js'

const router = express.Router()

// Submit contact form (public)
router.post('/', contactController.submitContact)

// Get all contact submissions (admin only)
router.get('/', protect, authorize('admin'), contactController.getContactSubmissions)

// Respond to contact (admin only)
router.put('/:id/respond', protect, authorize('admin'), contactController.respondContact)

// Update contact status (admin only)
router.put('/:id/status', protect, authorize('admin'), contactController.updateContactStatus)

// Delete contact (admin only)
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact)

export default router
