export const userDocs = {
  tags: [
    {
      name: 'Users',
      description: 'User management and follow system',
    },
  ],
  paths: {
    '/api/users': {
      post: {
        summary: 'Create a new user (Admin only)',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized - Token missing or invalid' },
          403: { description: 'Unauthorized - Only admins can create users' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get a user by ID',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: { description: 'User retrieved successfully' },
          401: { description: 'Unauthorized - Token missing or invalid' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/users/{id}/follow': {
      post: {
        summary: 'Follow a user',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID to follow',
          },
        ],
        responses: {
          200: { description: 'User followed successfully' },
          403: { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Unfollow a user',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID to unfollow',
          },
        ],
        responses: {
          200: { description: 'User unfollowed successfully' },
          403: { description: 'Unauthorized' },
        },
      },
    },
    '/api/users/{id}/followers': {
      get: {
        summary: 'Get followers of a user',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: { description: 'List of followers retrieved successfully' },
          401: { description: 'Unauthorized - Token missing or invalid' },
        },
      },
    },
  },
};
