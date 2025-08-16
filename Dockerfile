# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS builder
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/. ./

# Build the production version of the React app
RUN npm run build

# --- Stage 2: Setup the Node.js Backend ---
FROM node:18-alpine
WORKDIR /app/backend

# Copy backend package files and install only production dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY backend/. ./

# --- Final Step: Combine ---
# Copy the built frontend from the 'builder' stage into the backend's 'public' folder
COPY --from=builder /app/frontend/dist ./public

# Tell Docker which port the container will listen on
EXPOSE 3001

# The command to run when the container starts
CMD ["node", "server.js"]