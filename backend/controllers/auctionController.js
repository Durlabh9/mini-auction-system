
import db from '../models/index.js';
import { sendConfirmationEmails } from '../services/emailService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
const Auction = db.Auction;
const User = db.User;
const Bid = db.Bid;
export const createAuction = async (req, res) => {
  try {
    const { itemName, description, startingPrice, bidIncrement, startTime, endTime } = req.body;

    const sellerId = req.user.id; 

    const newAuction = await Auction.create({
      itemName,
      description,
      startingPrice,
      currentPrice: startingPrice, 
      bidIncrement,
      startTime,
      endTime,
      sellerId,
      status: 'active'
    });

    res.status(201).json(newAuction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating auction', error: error.message });
  }
};
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAll({

      include: {
        model: User,
        as: 'seller',
        attributes: ['username'] 
      },
      order: [['createdAt', 'DESC']] 
    });
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions', error: error.message });
  }
};
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include:[ { model: User, as: 'seller', attributes: ['username'] },
       { model: User, as: 'winner', attributes: ['username'] }]
    });
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
            if (new Date() > new Date(auction.endTime) && auction.status === 'active') {
            auction.status = 'ended';
            await auction.save();
            
        }
     const highestBid = await Bid.findOne({ where: { auctionId: auction.id }, order: [['amount', 'DESC']] });
    const auctionData = auction.get({ plain: true });
        if (highestBid) {
            auctionData.highestBidderId = highestBid.bidderId;
        }
     res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auction', error: error.message });
  }
};

export const acceptBid = async (req, res) => {
  const { io } = req;
  try {
    const { id } = req.params;

    const auction = await Auction.findByPk(id, {
      include: [{ model: User, as: 'seller' }]
    });
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found.' });
    }

    
    if (auction.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller of this auction.' });
    }
    if (new Date() < new Date(auction.endTime)) {
      return res.status(400).json({ message: 'This auction has not ended yet.' });
    }

    const winningBid = await Bid.findOne({
      where: { auctionId: id },
      order: [['amount', 'DESC']],
      include: [{ model: User, as: 'bidder' }]
    });

    if (winningBid) {
      auction.winnerId = winningBid.bidderId;    
    auction.status = 'closed';
    await auction.save();

      const seller = auction.seller;
      const buyer = winningBid.bidder;
      
      const invoiceBuffer = await generateInvoicePDF(seller, buyer, auction);
      await sendConfirmationEmails(seller, buyer, auction, invoiceBuffer);
       io.to(`auction-${id}`).emit('auctionUpdated'); 
    }else {
            auction.status = 'closed'; // Close with no winner if no bids
            await auction.save();
            io.to(`auction-${id}`).emit('auctionUpdated'); // Broadcast update
        }

    res.status(200).json({ message: 'Bid accepted and auction closed.', auction });
  } catch (error) {
    console.error('❌ FAILED TO ACCEPT BID:', error); 
    res.status(500).json({ message: 'Error accepting bid', error: error.message });
  }
};

export const rejectBid = async (req, res) => {
  const { io } = req;
  try {
    const { id } = req.params;
    const auction = await Auction.findByPk(id);

    // Security checks
    if (auction.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller.' });
    }
    if (new Date() < new Date(auction.endTime)) {
      return res.status(400).json({ message: 'Auction has not ended yet.' });
    }

    auction.status = 'rejected';
    await auction.save();
 io.to(`auction-${id}`).emit('auctionUpdated');
    
    
    res.status(200).json({ message: 'The highest bid has been rejected.', auction });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting bid', error: error.message });
  }
};


export const makeCounterOffer = async (req, res) => {
  const { io } = req;
  try {
    const { id } = req.params;
    const { newPrice } = req.body;
    const auction = await Auction.findByPk(id);


    if (auction.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller.' });
    }
    if (new Date() < new Date(auction.endTime)) {
      return res.status(400).json({ message: 'Auction has not ended yet.' });
    }

    auction.status = 'counter-offered';
    auction.counterOfferPrice = newPrice;
    await auction.save();
     const room = `auction-${id}`;
    io.to(room).emit('auctionUpdated');
    res.status(200).json({ message: 'Counter-offer made.', auction });
  } catch (error) {
    res.status(500).json({ message: 'Error making counter-offer', error: error.message });
  }
};


export const acceptCounterOffer = async (req, res) => {
  const { io } = req;
  try {
    const { id } = req.params;
    const auction = await Auction.findByPk(id, { include: ['seller'] });

    const highestBid = await Bid.findOne({
      where: { auctionId: id },
      order: [['amount', 'DESC']],
      include: ['bidder']
    });


    if (!highestBid || highestBid.bidderId !== req.user.id) {
      return res.status(403).json({ message: 'Only the highest bidder can respond to a counter-offer.' });
    }

    auction.winnerId = highestBid.bidderId;
    auction.currentPrice = auction.counterOfferPrice; 
    auction.status = 'closed';
    await auction.save();


    const seller = auction.seller;
    const buyer = highestBid.bidder;
    const invoiceBuffer = await generateInvoicePDF(seller, buyer, auction);
    await sendConfirmationEmails(seller, buyer, auction, invoiceBuffer);
io.to(`auction-${id}`).emit('auctionUpdated'); 
    res.status(200).json({ message: 'Counter-offer accepted.', auction });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting counter-offer.', error: error.message });
  }
};

export const rejectCounterOffer = async (req, res) => {
  const { io } = req;
    try {
        const { id } = req.params;
        const auction = await Auction.findByPk(id);


        const highestBid = await Bid.findOne({ where: { auctionId: id }, order: [['amount', 'DESC']] });
        if (!highestBid || highestBid.bidderId !== req.user.id) {
            return res.status(403).json({ message: 'Only the highest bidder can respond.' });
        }

        auction.status = 'rejected';
        await auction.save();
        io.to(`auction-${id}`).emit('auctionUpdated');
        res.status(200).json({ message: 'Counter-offer rejected.', auction });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting counter-offer.', error: error.message });
    }
};