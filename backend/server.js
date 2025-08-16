import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database.js';
import { syncDatabase } from './models/index.js'; 
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import { initSocketIO } from './socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = initSocketIO(httpServer); 

const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/auth', authRoutes); 
app.use('/api/auctions', auctionRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    await syncDatabase(); 
    
  } catch (error) {
    console.error('❌ Unable to connect to or sync the database:', error);
  }
};


app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes(io));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  startServer();
});