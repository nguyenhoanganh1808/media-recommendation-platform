import { Request, Response, NextFunction } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { logger } from '../config/logger';
import { config } from '../config/env';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaKnownRequestError = (err: PrismaClientKnownRequestError) => {
  let message = 'Database error occurred';
  let statusCode = 500;

  // Handle unique constraint violations
  if (err.code === 'P2002') {
    const field = (err.meta?.target as string[]) || ['field'];
    message = `Duplicate value for ${field.join(', ')}. Please use another value.`;
    statusCode = 409;
  }

  // Handle not found errors
  if (err.code === 'P2025') {
    message = 'Record not found';
    statusCode = 404;
  }

  // Handle foreign key constraint failures
  if (err.code === 'P2003') {
    message = 'Related record not found';
    statusCode = 400;
  }

  return new AppError(message, statusCode);
};

// Handle Prisma validation errors
const handlePrismaValidationError = (err: PrismaClientValidationError) => {
  return new AppError('Invalid input data', 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

// Handle JWT expired error
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

// Error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error(
    `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    {
      stack: err.stack,
    }
  );

  // Specific error handling
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Handle specific errors
  if (error instanceof PrismaClientKnownRequestError) {
    error = handlePrismaKnownRequestError(error);
  }
  if (error instanceof PrismaClientValidationError) {
    error = handlePrismaValidationError(error);
  }
  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Development error response - with stack trace
  if (config.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  }

  // Production error response - without sensitive error details
  // Don't leak operational details for security reasons
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Generic error message for non-operational errors in production
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

// Async handler to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
