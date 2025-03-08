// src/app.ts
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';

import { errorMiddleware } from './api/middlewares/error.middleware';
import logger from './config/logger';
import authRoutes from './api/routes/auth.routes';
import mediaRoutes from './api/routes/media.routes';
import ratingRoutes from './api/routes/rating.routes';
import recommendationRoutes from './api/routes/recommendation.routes';
import userListRoutes from './api/routes/userList.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      })
    );

    // Parsing middlewares
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Performance middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private configureRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/media', mediaRoutes);
    this.app.use('/api/ratings', ratingRoutes);
    this.app.use('/api/recommendations', recommendationRoutes);
    this.app.use('/api/lists', userListRoutes);

    // Health check route
    this.app.get('/health', (req, res) => {
      res
        .status(200)
        .json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.path}`,
      });
    });

    // Global error handler
    this.app.use(errorMiddleware);
  }
}

export default new App().app;
