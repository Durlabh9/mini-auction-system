
import express from 'express';
import { createAuction, getAllAuctions, getAuctionById ,acceptBid ,rejectBid,makeCounterOffer , acceptCounterOffer, rejectCounterOffer} from '../controllers/auctionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();
export default (io) => {
  router.get('/', getAllAuctions);
  router.get('/:id', getAuctionById);
  router.post('/', authMiddleware, createAuction);
  router.post('/:id/accept', authMiddleware, (req, res) => acceptBid(req, res, io));
  router.post('/:id/reject', authMiddleware, (req, res) => rejectBid(req, res, io));
  router.post('/:id/counter', authMiddleware, (req, res) => makeCounterOffer(req, res, io));
  router.post('/:id/accept-counter', authMiddleware, (req, res) => acceptCounterOffer(req, res, io));
  router.post('/:id/reject-counter', authMiddleware, (req, res) => rejectCounterOffer(req, res, io));
  return router;
};