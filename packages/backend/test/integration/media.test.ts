// tests/integration/auth.routes.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { hashPassword } from '../../src/utils/password';
import { Role } from '@prisma/client';

// Mock Redis to avoid rate limit issues in tests
jest.mock('../../src/config/redis', () => ({
  redisClient: {
    isReady: false,
    sendCommand: jest.fn(),
  },
}));

jest.mock('rate-limit-redis', () => ({
  RedisStore: jest.fn().mockImplementation(() => ({})),
}));

describe('Authentication Routes', () => {
  // Test user data
  const testUsers = {
    admin: {
      email: 'admin@test.com',
      password: 'Admin@123',
      username: 'admin_user',
      role: Role.ADMIN,
    },
    moderator: {
      email: 'mod@test.com',
      password: 'Moderator@123',
      username: 'mod_user',
      role: Role.MODERATOR,
    },
    regular: {
      email: 'user@test.com',
      password: 'User@123',
      username: 'regular_user',
      role: Role.USER,
    },
  };

  // Before all tests, create the test users in the database
  beforeAll(async () => {
    // Clear existing users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            testUsers.admin.email,
            testUsers.moderator.email,
            testUsers.regular.email,
          ],
        },
      },
    });

    // Create test users with hashed passwords
    for (const user of Object.values(testUsers)) {
      const hashedPassword = await hashPassword(user.password);
      await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          username: user.username,
          role: user.role,
        },
      });
    }
  });

  // After all tests, clean up
  afterAll(async () => {
    // Remove test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            testUsers.admin.email,
            testUsers.moderator.email,
            testUsers.regular.email,
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a valid user and return JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.regular.email,
          password: testUsers.regular.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUsers.regular.email);
      expect(response.body.data.user.role).toBe(testUsers.regular.role);
    });

    it('should authenticate admin user with correct role', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: testUsers.admin.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe(testUsers.admin.role);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.regular.email,
          password: 'wrong_password',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          // Missing email and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    const newUser = {
      email: 'newuser@test.com',
      password: 'NewUser@123',
      username: 'new_user',
      confirmPassword: 'NewUser@123',
    };

    // After each test, clean up the new user
    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { email: newUser.email },
      });
    });

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.role).toBe(Role.USER); // Default role
    });

    it('should reject registration with existing email', async () => {
      // First, create a user
      await request(app).post('/api/auth/register').send(newUser).expect(201);

      // Then try to register again with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Email already exists');
    });

    it('should validate password requirements', async () => {
      const weakPassword = {
        ...newUser,
        password: 'weak',
        confirmPassword: 'weak',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate password confirmation match', async () => {
      const mismatchPasswords = {
        ...newUser,
        confirmPassword: 'DifferentPassword@123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(mismatchPasswords)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let userToken: string;

    // Before tests, login to get token
    beforeAll(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      });

      userToken = response.body.data.token;
    });

    it('should return authenticated user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUsers.regular.email);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let userToken: string;

    // Before tests, login to get token
    beforeAll(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      });

      userToken = response.body.data.token;
    });

    it('should successfully log out an authenticated user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logged out');
    });

    it('should handle logout for unauthenticated requests', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Optional: Test password reset flow if implemented
  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUsers.regular.email })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200); // Still return 200 for security reasons

      expect(response.body.success).toBe(true);
    });
  });
});
