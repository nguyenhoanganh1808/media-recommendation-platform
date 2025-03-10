// tests/unit/users.service.test.ts

import { prismaMock } from '../fixtures/prisma-mock';
import * as userService from '../../src/api/users/users.service';
import { AppError } from '../../src/middlewares/error.middleware';
import * as passwordUtils from '../../src/utils/password';
import { Role } from '@prisma/client';

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword123'),
}));

// Mock the password utilities

describe('User Service', () => {
  it('should throw an error if user with email already exists', async () => {
    const existingUser = {
      id: 'dc77bfb2-80fe-487e-91e3-fe0b86a77e12',
      email: 'existing@example.com',
      username: 'existinguser',
      password: 'hashedPassword123',
      firstName: 'Existing',
      lastName: 'User',
      bio: null,
      avatar: null,
      isActive: true,
      role: Role.USER,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(existingUser);

    await expect(
      userService.createUser({
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
      })
    ).rejects.toThrow(AppError);
  });
});
