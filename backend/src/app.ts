import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeSocket } from './socket';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import schoolRoutes from './routes/school.routes';
import visitRoutes from './routes/visit.routes';
import analyticsRoutes from './routes/analytics.routes';
import noteRoutes from './routes/note.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

// Trust Nginx reverse proxy (required for express-rate-limit and correct IP detection)
app.set('trust proxy', 1);

// Serve uploaded files in development (before helmet so images load correctly)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [env.frontendUrl, 'http://localhost:3000', 'http://localhost:3001'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', apiLimiter);


// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chats', chatRoutes);

// Error handler
app.use(errorHandler);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initializeSocket(server);

// Start server
server.listen(env.port, () => {
  logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
});

export { server };
export default app;
