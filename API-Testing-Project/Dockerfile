# ==============================================================================
# Practical 11: Backend Dockerfile
# Node.js / Express REST API Application
# ==============================================================================

# Use official Node.js 20 LTS on lightweight Alpine Linux
FROM node:20-alpine

# Set container working directory
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies inside the container
RUN npm install --omit=dev

# Copy backend source code (excluding files listed in .dockerignore)
COPY . .

# Expose backend API port
EXPOSE 5000

# Set default production environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start Express REST API server
CMD ["node", "server.js"]
