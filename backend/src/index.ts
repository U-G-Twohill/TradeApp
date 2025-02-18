import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { routes } from './routes';
import { authRoutes } from './routes/auth';
import { initializeDatabase } from './config/database';
import { userRoutes } from './routes/users';
import { jobRoutes } from './routes/jobs';
import { taskRoutes } from './routes/tasks';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { apiLimiter } from './config/rateLimit';

// Load environment variables
config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to TradeApp API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      },
      health: '/api/health'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', taskRoutes);
app.use('/api', routes);

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info('Available endpoints:');
      logger.info('- POST /api/auth/register');
      logger.info('- POST /api/auth/login');
      logger.info('- GET /api/health');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 