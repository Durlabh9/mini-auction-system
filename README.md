# Project description and setup instructions
🚀 Mini Auction System (Real-Time Bidding)

This is a full-stack, real-time auction platform where users can create and view auctions, place bids instantly, and manage post-auction decisions. The application is built with a modern tech stack, featuring a Node.js backend, a React frontend, and real-time communication managed by WebSockets and Redis.
The entire application is containerized with Docker and deployed on Render.

✨ Features
 * User Authentication: Secure user registration and login using JWTs.
 * Auction Creation: Logged-in users can create detailed auctions, specifying item name, description, starting price, bid increment, and duration.
 * Real-Time Bidding Room: A live auction page where all participants can see the current highest bid update instantly without a page refresh.
 * Live Countdown Timer: A visual timer on each auction page that counts down to the end time.
 * Instant Notifications:
   * All users in an auction room see new bids in real-time.
   * The previous highest bidder receives a specific "You have been outbid!" notification.
   * The UI updates in real-time when the auction status changes (e.g., a counter-offer is made).
 * Complete Seller Flow: Once an auction ends, the seller has a dedicated interface to:
   * ✅ Accept the highest bid.
   * ❌ Reject the highest bid.
   * ↪️ Make a Counter-Offer with a new price.
 * Complete Buyer Flow: The highest bidder can:
   * ✅ Accept a counter-offer from the seller.
   * ❌ Reject a counter-offer.
 * Automated Invoices & Emails: Upon a successful auction (bid accepted directly or via counter-offer), PDF invoices are automatically generated and emailed to both the buyer and the seller via SendGrid.
 * Professional UI: A clean, modern, and responsive user interface with a sophisticated dark theme.

🛠️ Tech Stack
 * Frontend: React.js, Vite, Socket.IO Client
 * Backend: Node.js, Express.js
 * Real-Time Communication: Socket.IO
 * Database: Supabase (PostgreSQL) with Sequelize ORM
 * In-Memory Store: Upstash (Redis) for managing live bids
 * Email Service: SendGrid for transactional emails
 * Deployment: Docker & Render.com
 * CI/CD: GitHub Actions for automated deployments on push to main.

🏁 Getting Started
To get a local copy up and running, follow these simple steps.
Prerequisites
 * Node.js (v18 or later)
 * npm
 * Git
 * Docker (optional, for local container testing)

Installation
 * Clone the repo
   git clone https://github.com/Durlabh9/mini-auction-system.git

cd mini-auction-system

 * Install Backend Dependencies
   cd backend
npm install

 * Install Frontend Dependencies
   cd ../frontend
npm install

 * Set Up Environment Variables
   * In the backend folder, create a .env file.
   * Copy the contents of .env.example (if provided) or add the variables listed below.

Environment Variables
You will need to create accounts for the following services and add your credentials to the backend/.env file:

# Supabase PostgreSQL Connection URL (use the Connection Pooler string)
DATABASE_URL="postgres://..."

# Upstash Redis Connection URL
REDIS_URL="redis://..."

# SendGrid API Key
SENDGRID_API_KEY="SG.your-key"

# JWT Secret for signing tokens (use a long, random string)
JWT_SECRET="your_super_secret_string"

# Port for the backend server
PORT=3001

Running the Application
You need to run two servers concurrently in separate terminals.
 * Start the Backend Server (from the backend folder)
   npm start

 * Start the Frontend Server (from the frontend folder)
   npm run dev

The application will be available at http://localhost:5173.

🚢 Deployment
This application is configured for seamless deployment on Render using a multi-stage Dockerfile.
 * The frontend and backend are bundled into a single container.
 * On every push to the main branch, a GitHub Action automatically triggers a new deployment via a Deploy Hook.
 * All necessary environment variables must be configured in the Render service's environment settings.

