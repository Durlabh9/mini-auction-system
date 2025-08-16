
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true,
  updatedAt: false 
});

export default Bid;