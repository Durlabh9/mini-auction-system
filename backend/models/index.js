
import sequelize from '../config/database.js';
import User from './user.js';
import Auction from './auction.js';
import Bid from './bid.js';


User.hasMany(Auction, { foreignKey: 'sellerId', as: 'auctions' });
Auction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });


Auction.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });


User.hasMany(Bid, { foreignKey: 'bidderId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });


Auction.hasMany(Bid, { foreignKey: 'auctionId', as: 'bids' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });




const db = {
  sequelize,
  User,
  Auction,
  Bid
};

export const syncDatabase = async () => {
  try {

    await sequelize.sync({ alter: true }); 
    console.log('✅ All models were synchronized successfully.');
  } catch (error) {
    console.error('❌ An error occurred while synchronizing the database:', error);
  }
};

export default db;