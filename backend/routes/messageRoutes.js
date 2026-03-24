import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import * as messageController from '../controllers/messageController.js'

const router = express.Router()

// Get available users (for composing messages) - MUST BE BEFORE generic routes
router.get('/users/available', protect, messageController.getAvailableUsers)

// Get unread count
router.get('/unread/count', protect, messageController.getUnreadCount)

// Get messages (inbox/sent)
router.get('/', protect, messageController.getMessages)

// Send message
router.post('/send', protect, messageController.sendMessage)

// Mark as read
router.put('/:id/read', protect, messageController.markAsRead)

// Delete message
router.delete('/:id', protect, messageController.deleteMessage)

export default router
