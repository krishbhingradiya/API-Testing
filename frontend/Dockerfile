# ==============================================================================
# Practical 11: Frontend Dockerfile
# React (Vite) Application
# ==============================================================================

# Use official Node.js 20 LTS on lightweight Alpine Linux
FROM node:20-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy application source code
COPY . .

# Inject Backend API URL at build time (defaults to Docker Compose backend service on port 5000)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Compile production bundle
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve production build on host 0.0.0.0 and port 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
