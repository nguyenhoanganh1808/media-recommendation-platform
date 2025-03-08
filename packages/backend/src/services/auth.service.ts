// src/services/auth.service.ts
import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthResponse,
  LoginUserDto,
  RegisterUserDto,
  RefreshTokenDto,
  TokenPair,
  AuthTokenPayload,
} from '../types/auth.types';
import { ApiError } from '../api/middlewares/error.middleware';
import logger from '../config/logger';
import ENV from '../config/env';

export class AuthService {
  private prisma: PrismaClient;
  private SALT_ROUNDS = 10;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    // Check if user with email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === userData.email ? 'email' : 'username';
      throw new ApiError(
        409,
        `User with this ${field} already exists`,
        'USER_EXISTS'
      );
    }

    // Hash password
    const hashedPassword = await hash(userData.password, this.SALT_ROUNDS);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        preferences: {
          create: {
            preferredGenres: [],
            dislikedGenres: [],
          },
        },
      },
    });

    // Generate authentication tokens
    const tokens = await this.generateTokens(newUser);

    // Return user data and tokens
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
        avatar: newUser.avatar || undefined,
      },
      tokens,
    };
  }

  /**
   * Log in an existing user
   */
  async login(credentials: LoginUserDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new ApiError(
        401,
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(
        403,
        'User account is deactivated',
        'ACCOUNT_DEACTIVATED'
      );
    }

    // Verify password
    const isPasswordValid = await compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(
        401,
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    // Generate authentication tokens
    const tokens = await this.generateTokens(user);

    // Return user data and tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatar: user.avatar || undefined,
      },
      tokens,
    };
  }

  /**
   * Logout a user by invalidating their refresh token
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  /**
   * Refresh the access token using a valid refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenPair> {
    const { refreshToken } = refreshTokenDto;

    // Verify the refresh token exists in the database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new ApiError(401, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new ApiError(401, 'Refresh token expired', 'TOKEN_EXPIRED');
    }

    // Generate new token pair
    const tokens = await this.generateTokens(storedToken.user);

    // Delete the used refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return tokens;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private async generateTokens(user: User): Promise<TokenPair> {
    // Generate access token
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
      // expiresIn: ENV.JWT_EXPIRES_IN as string
      expiresIn: '1h',
    });

    // Generate refresh token
    const refreshToken = uuidv4();

    // Calculate refresh token expiration (e.g., 7 days)
    const refreshTokenExpiresIn = ENV.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresAt = new Date();

    // Parse expiration string (e.g., "7d", "30d", "24h")
    const match = refreshTokenExpiresIn.match(/^(\d+)([dh])$/);
    if (match) {
      const [, value, unit] = match;
      const numValue = parseInt(value, 10);

      if (unit === 'd') {
        expiresAt.setDate(expiresAt.getDate() + numValue);
      } else if (unit === 'h') {
        expiresAt.setHours(expiresAt.getHours() + numValue);
      }
    } else {
      // Default to 7 days if format is invalid
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(
        401,
        'Current password is incorrect',
        'INVALID_PASSWORD'
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export default new AuthService(new PrismaClient());
