import { PrismaClient, User, RefreshToken } from '@prisma/client';
import {
  RegisterUserDto,
  AuthTokens,
  LoginUserDto,
  AuthUser,
} from '../../types/auth.types';
import { hashPassword, comparePasswords } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiryDate,
} from '../../utils/jwt';

const prisma = new PrismaClient();

/**
 * Register a new user
 *
 * @param userData User registration data
 * @returns Newly created user and auth tokens
 */
export const registerUser = async (
  userData: RegisterUserDto
): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
  // Check if user with email already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUserByEmail) {
    throw new Error('User with this email already exists');
  }

  // Check if user with username already exists
  const existingUserByUsername = await prisma.user.findUnique({
    where: { username: userData.username },
  });

  if (existingUserByUsername) {
    throw new Error('User with this username already exists');
  }

  // Hash the password
  const hashedPassword = await hashPassword(userData.password);

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      lastLogin: new Date(),
    },
  });

  // Generate tokens
  const tokens = await createTokens(newUser);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    },
    tokens,
  };
};

/**
 * Login a user with email and password
 *
 * @param loginData Login credentials
 * @returns Authenticated user and auth tokens
 */
export const loginUser = async (
  loginData: LoginUserDto
): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare passwords
  const isPasswordValid = await comparePasswords(
    loginData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const tokens = await createTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    tokens,
  };
};

/**
 * Refresh access token using a valid refresh token
 *
 * @param refreshToken The refresh token
 * @returns New auth tokens
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  // Find the refresh token in database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > tokenRecord.expiresAt) {
    // Remove expired token
    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });
    throw new Error('Refresh token expired');
  }

  // Generate new tokens
  const tokens = await createTokens(tokenRecord.user);

  // Delete old refresh token
  await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  });

  return tokens;
};

/**
 * Logout a user by invalidating their refresh token
 *
 * @param refreshToken The refresh token to invalidate
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  // Delete the refresh token
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

/**
 * Create access and refresh tokens for a user
 *
 * @param user User to create tokens for
 * @returns Access and refresh tokens
 */
const createTokens = async (user: User): Promise<AuthTokens> => {
  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshTokenString = generateRefreshToken();
  const expiresAt = getRefreshTokenExpiryDate();

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshTokenString,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenString,
  };
};

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
