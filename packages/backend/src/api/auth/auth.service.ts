import { prisma } from '../../config/database';
import { hashPassword, comparePasswords } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiryDate,
} from '../../utils/jwt';
import { Role, User, RefreshToken } from '@prisma/client';

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  username: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new Error('User with this email or username already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role: Role.USER,
      lastLogin: new Date(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(newUser as any);
  const refreshToken = generateRefreshToken(newUser as any);
  const expiresAt = getRefreshTokenExpiryDate();

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      userId: newUser.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    user: newUser,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt,
    },
  };
};

/**
 * Login a user
 */
export const loginUser = async (email: string, password: string) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Your account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = getRefreshTokenExpiryDate();

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt,
    },
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  // Find the refresh token in the database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    throw new Error('Refresh token has expired');
  }

  // Generate new access token
  const accessToken = generateAccessToken(storedToken.user);

  return { accessToken };
};

/**
 * Logout a user by invalidating refresh tokens
 */
export const logoutUser = async (refreshToken: string, userId?: string) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  // Delete the refresh token
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { token: refreshToken },
        // Also delete any tokens for this user if they're authenticated
        userId ? { userId } : {},
      ],
    },
  });
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      bio: true,
      avatar: true,
      role: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          following: true,
          followers: true,
          mediaLists: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
