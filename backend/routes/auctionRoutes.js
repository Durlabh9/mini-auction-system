
import express from 'express';
import { createAuction, getAllAuctions, getAuctionById ,acceptBid ,rejectBid,makeCounterOffer , acceptCounterOffer, rejectCounterOffer} from '../controllers/auctionController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();


router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);
router.post('/', authMiddleware, createAuction);
router.post('/:id/accept', authMiddleware, acceptBid);
router.post('/:id/counter', authMiddleware, makeCounterOffer);
router.post('/:id/reject', authMiddleware, rejectBid);
router.post('/:id/accept-counter', authMiddleware, acceptCounterOffer);
router.post('/:id/reject-counter', authMiddleware, rejectCounterOffer);
export default router;