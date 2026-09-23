const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const loggerMiddleware = require('./src/middleware/logger');
const contentTypeMiddleware = require('./src/middleware/contentType');
const notFoundHandler = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const taskRoutes = require('./src/routes/taskRoutes');
const debugRoutes = require('./src/routes/debugRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';

// Connect to MongoDB Database
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// 1. Parse JSON body payloads
app.use(express.json());

// Enable CORS for React frontend (localhost:5173)
app.use(cors());

// 2. Serve Static Frontend Files from /public
app.use(express.static('public'));

// 3. Global Request Logging Middleware
app.use(loggerMiddleware);

// 4. Content-Type Validation Middleware
app.use(contentTypeMiddleware);

// 5. Mount REST API Routes
app.use('/tasks', taskRoutes);
app.use('/debug', debugRoutes);

// 6. 404 Handler for undefined routes
app.use(notFoundHandler);

// 7. Centralized Global Error Handling Middleware (MUST BE DECLARED LAST)
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Task Manager API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
