// src/api/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import authService from '../../services/auth.service';
import logger from '../../config/logger';
import {
  LoginUserDto,
  RegisterUserDto,
  RefreshTokenDto,
} from '../../types/auth.types';
import { prisma } from '../../server';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: RegisterUserDto = req.body;
    const result = await authService.register(userData);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const credentials: LoginUserDto = req.body;
    const result = await authService.login(credentials);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken || !req.user) {
      res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
      return;
    }

    await authService.logout(req.user.id, refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshTokenDto: RefreshTokenDto = req.body;
    const tokens = await authService.refreshToken(refreshTokenDto);

    res.status(200).json({
      status: 'success',
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        createdAt: true,
        preferences: {
          select: {
            preferredGenres: true,
            dislikedGenres: true,
            minRating: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getProfile,
};
