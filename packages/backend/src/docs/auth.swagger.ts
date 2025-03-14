// src/docs/auth.swagger.ts
export const authDocs = {
  tags: [
    {
      name: 'Users',
      description: 'User management and follow system',
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description:
          'Register a new user with email, username, password, firstName, and lastName.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
                required: [
                  'email',
                  'username',
                  'password',
                  'firstName',
                  'lastName',
                ],
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          409: {
            description: 'User with this email or username already exists',
          },
          400: { description: 'Invalid input data' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        summary: 'Login a user',
        description: 'Login a user with email and password.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid email or password' },
          403: { description: 'Account deactivated' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        summary: 'Logout a user',
        description: 'Logout a user by invalidating the refresh token.',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Logout successful' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/api/auth/refresh-token': {
      post: {
        summary: 'Refresh access token',
        description: 'Refresh the access token using a valid refresh token.',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Access token refreshed successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },

    '/api/auth/profile': {
      get: {
        summary: 'Get current user profile',
        description: 'Get the profile of the currently authenticated user.',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/api/auth/change-password': {
      post: {
        summary: 'Change user password',
        description: 'Change the password of the currently authenticated user.',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  oldPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password' },
                },
                required: ['oldPassword', 'newPassword'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          401: { description: 'Unauthorized or invalid old password' },
        },
      },
    },
  },
};
