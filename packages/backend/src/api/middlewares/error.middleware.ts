// src/api/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../../config/logger';
import ENV from '../../config/env';

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.path} - Error:`, {
    message: error.message,
    stack: ENV.NODE_ENV === 'development' ? error.stack : undefined,
    name: error.name,
  });

  // Handle ApiError instances
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      res.status(409).json({
        status: 'error',
        message: `A record with this ${target.join(', ')} already exists`,
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
      });
      return;
    }

    // Handle record not found
    if (error.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND',
      });
      return;
    }
  }

  // Handle validation errors (e.g., from express-validator)
  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: (error as any).errors,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    status: 'error',
    message:
      ENV.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
};
