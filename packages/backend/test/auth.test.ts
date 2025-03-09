import request from 'supertest';
import { Express } from 'express';
import { prisma } from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import app from '../src/app';

let server: Express;
let testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'TestPassword123',
  hashedPassword: '',
};
let accessToken = '';
let refreshToken = '';

beforeAll(async () => {
  server = app;
  // Create test user with hashed password
  testUser.hashedPassword = await hashPassword(testUser.password);
});

afterAll(async () => {
  // Clean up test data
  await prisma.refreshToken.deleteMany({
    where: {
      user: {
        email: testUser.email,
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: testUser.email,
    },
  });
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should not register a user with existing email', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: testUser.email,
        username: 'anotheruser',
        password: 'AnotherPassword123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // Save tokens for later tests
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should not get profile without token', async () => {
      const res = await request(server).get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      const res = await request(server).post('/api/auth/refresh-token').send({
        refreshToken: refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // Update tokens for later tests
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTestPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Update test user password
      testUser.password = 'NewTestPassword123';
    });

    it('should not change password with incorrect current password', async () => {
      const res = await request(server)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: 'AnotherNewPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout a user', async () => {
      const res = await request(server)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken: refreshToken,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
