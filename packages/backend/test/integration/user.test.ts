// tests/integration/user.api.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/utils/jwt';

// Clear the database before tests
beforeAll(async () => {
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
});

describe('User API', () => {
  let userId: string;
  let adminId: string;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Create a test user and admin for testing
    const user = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'hashedpassword', // In real tests, use actual hashed password
        isActive: true,
        role: 'USER',
      },
    });
    userId = user.id;
    userToken = generateAccessToken(user);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: 'hashedpassword',
        isActive: true,
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    adminToken = generateAccessToken(admin);
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app).post('/api/users').send({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app).post('/api/users').send({
        email: 'invalid-email',
        username: 'a', // Too short
        password: 'short', // Too short
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user data', async () => {
      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty(
        'email',
        'testuser@example.com'
      );
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get(
        '/api/users/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user when authenticated as the same user', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'Updated bio',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bio', 'Updated bio');
    });

    it('should deny update when not authenticated as the user', async () => {
      // Create a second user
      const user2 = await prisma.user.create({
        data: {
          email: 'user2@example.com',
          username: 'user2',
          password: 'hashedpassword',
          isActive: true,
          role: 'USER',
        },
      });
      const user2Token = generateAccessToken(user2);

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          bio: 'Unauthorized update',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow admin to update any user', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bio: 'Admin updated this',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bio', 'Admin updated this');
    });
  });
});
