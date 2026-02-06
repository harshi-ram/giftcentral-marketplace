import express from 'express';
import { 
  getReceivedGiftRequests, 
  createGiftRequest,
  acceptGiftRequest,
  declineGiftRequest,
  markGiftRequestsAsRead,
  getMailbox,
  markMailboxAsRead
} from '../controllers/giftRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/received', protect, getReceivedGiftRequests);
router.post('/', protect, createGiftRequest);
router.patch('/mark-read', protect, markGiftRequestsAsRead);
router.patch('/mailbox/mark-read', protect, markMailboxAsRead);
router.put('/:id/accept', protect, acceptGiftRequest);
router.put('/:id/decline', protect, declineGiftRequest);
router.get('/mailbox', protect, getMailbox);

export default router;