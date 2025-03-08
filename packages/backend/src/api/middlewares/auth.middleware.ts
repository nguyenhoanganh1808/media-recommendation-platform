// src/api/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../server';
import ENV from '../../config/env';
import logger from '../../config/logger';
import { AuthTokenPayload } from '../../types/auth.types';
import { Role } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res
        .status(401)
        .json({ status: 'error', message: 'Authentication token is required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res
        .status(401)
        .json({ status: 'error', message: 'User not found or inactive' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    } else {
      logger.error('Authentication error:', error);
      res
        .status(500)
        .json({ status: 'error', message: 'Authentication failed' });
    }
  }
};

export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ status: 'error', message: 'Authentication required' });
      return;
    }

    // Check if user is an admin (You'll need to add an isAdmin field to your User model)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true },
    });

    if (!user || !user.role.includes(Role.ADMIN)) {
      res
        .status(403)
        .json({ status: 'error', message: 'Admin privileges required' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    res.status(500).json({ status: 'error', message: 'Authorization failed' });
  }
};
