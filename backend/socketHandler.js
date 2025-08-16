import { Server } from 'socket.io';
import redis from './redisClient.js';
import db from './models/index.js';

const { Bid, Auction } = db;


const userSockets = {};

export const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('registerUser', (userId) => {
      if (userId) {
        userSockets[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    });

    socket.on('joinAuction', async (auctionId) => {
      const room = `auction-${auctionId}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined room ${room}`);
      
      const auction = await Auction.findByPk(auctionId);
      if (auction) {
        await redis.setnx(`auction:${auctionId}:highestBid`, auction.currentPrice);
        await redis.setnx(`auction:${auctionId}:increment`, auction.bidIncrement);
        await redis.setnx(`auction:${auctionId}:endTime`, auction.endTime.toISOString());
        
        const highestBid = await Bid.findOne({ where: { auctionId }, order: [['amount', 'DESC']] });
        if (highestBid) {
          await redis.setnx(`auction:${auctionId}:highestBidderId`, highestBid.bidderId);
        }
      }
    });

    socket.on('placeBid', async (data) => {
      const { auctionId, bidAmount, userId } = data;
      const room = `auction-${auctionId}`;

      const previousHighestBidderId = await redis.get(`auction:${auctionId}:highestBidderId`);
      
      const highestBid = parseFloat(await redis.get(`auction:${auctionId}:highestBid`));
      const increment = parseFloat(await redis.get(`auction:${auctionId}:increment`));
      const endTime = new Date(await redis.get(`auction:${auctionId}:endTime`));

      if (Date.now() >= endTime) {
        return socket.emit('bidError', { message: 'This auction has ended.' });
      }
      if (bidAmount < highestBid + increment) {
        return socket.emit('bidError', { message: 'Your bid is too low.' });
      }

      await redis.set(`auction:${auctionId}:highestBid`, bidAmount);
      await redis.set(`auction:${auctionId}:highestBidderId`, userId); 
      io.to(room).emit('newHighestBid', { bidAmount, userId });

      if (previousHighestBidderId && previousHighestBidderId !== String(userId)) {
        const outbidSocketId = userSockets[previousHighestBidderId];
        if (outbidSocketId) {
          io.to(outbidSocketId).emit('outbid', { message: `You have been outbid on auction #${auctionId}!` });
        }
      }
      
      Bid.create({ amount: bidAmount, auctionId, bidderId: userId });
      Auction.update({ currentPrice: bidAmount }, { where: { id: auctionId } });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      for (const userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          delete userSockets[userId];
          console.log(`User ${userId} unregistered.`);
          break;
        }
      }
    });
  });
   return io;
};