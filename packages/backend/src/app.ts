import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import passport from './config/passport';

// Import configurations
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { disconnectDB } from './config/database';
import { disconnectRedis } from './config/redis';

// Import routes
import authRoutes from './api/auth/auth.routes';
// import userRoutes from './api/users/users.routes';
// import mediaRoutes from './api/media/media.routes';
// import ratingRoutes from './api/ratings/ratings.routes';
// import reviewRoutes from './api/media/media.routes';
// import listRoutes from './api/lists/lists.routes';
// import recommendationRoutes from './api/recommendations/recommendations.routes';
// import notificationRoutes from './api/notifications/notifications.routes';

// Initialize Prisma Client

// Initialize Express application
const app: Express = express();

// Swagger documentation options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Media Recommendation API',
      version: '1.0.0',
      description: 'API for a media recommendation platform',
    },

    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional: Specify the token format
          description: 'Enter your access token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply this security scheme globally (optional)
      },
    ],
  },
  apis: ['./src/api/**/*.routes.ts', './src/api/**/*.validation.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Rate limiting
if (config.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: 'success', message: 'API is running', data: null });
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/media', mediaRoutes);
// app.use('/api/v1/ratings', ratingRoutes);
// app.use('/api/v1/reviews', reviewRoutes);
// app.use('/api/v1/lists', listRoutes);
// app.use('/api/v1/recommendations', recommendationRoutes);
// app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handler
app.use(errorHandler);

// Handle graceful shutdown
process.on('exit', async () => {
  await disconnectDB();
  logger.info('Disconnected from database');
  await disconnectRedis();
  logger.info('Disconnected from redis');
});

export default app;
