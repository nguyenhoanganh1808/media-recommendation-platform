export const mediaDocs = {
  tags: [
    {
      name: 'Media',
      description: 'Media retrieval and filtering',
    },
  ],
  components: {
    schemas: {
      Media: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '12345' },
          title: { type: 'string', example: 'Inception' },
          description: { type: 'string', example: 'A mind-bending thriller' },
          type: { type: 'string', example: 'movie' },
          genre: { type: 'string', example: 'sci-fi' },
          popularity: { type: 'number', example: 8.9 },
          releaseDate: {
            type: 'string',
            format: 'date',
            example: '2010-07-16',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
      MediaCreate: {
        type: 'object',
        required: ['title', 'type', 'genre', 'releaseDate'],
        properties: {
          title: { type: 'string', example: 'Inception' },
          type: {
            type: 'string',
            enum: ['movie', 'tv', 'anime'],
            example: 'movie',
          },
          genre: { type: 'string', example: 'Sci-Fi' },
          popularity: { type: 'number', example: 9.5 },
          releaseDate: {
            type: 'string',
            format: 'date',
            example: '2010-07-16',
          },
        },
      },
      MediaUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Inception Updated' },
          type: {
            type: 'string',
            enum: ['movie', 'tv', 'anime'],
            example: 'movie',
          },
          genre: { type: 'string', example: 'Sci-Fi' },
          popularity: { type: 'number', example: 9.8 },
          releaseDate: {
            type: 'string',
            format: 'date',
            example: '2010-07-16',
          },
        },
      },
      MediaResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Media fetched successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
          meta: {
            type: 'object',
            properties: {
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/media': {
      get: {
        summary: 'Get all media',
        description:
          'Retrieve a paginated list of media items. Supports filtering by type, genre, and search query, as well as sorting options.',
        tags: ['Media'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination (default: 1)',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of media items per page (default: 10)',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Filter media by type (e.g., movie, series, anime)',
            schema: { type: 'string' },
          },
          {
            name: 'genre',
            in: 'query',
            description: 'Filter media by genre (e.g., action, drama, sci-fi)',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search for media by title or description',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Sort media by field (default: popularity)',
            schema: {
              type: 'string',
              enum: ['popularity', 'release_date', 'rating'],
              default: 'popularity',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            description: 'Sort order (asc or desc, default: desc)',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'Media fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaResponse' },
              },
            },
          },
          400: { description: 'Invalid request parameters' },
          429: { description: 'Too many requests (Rate limit exceeded)' },
        },
      },
      post: {
        summary: 'Create new media',
        description: 'Allows an admin or moderator to add a new media item.',
        tags: ['Media'],
        security: [{ BearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MediaCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Media created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaResponse' },
              },
            },
          },
          400: { description: 'Invalid input data' },
          403: { description: 'Forbidden - Requires ADMIN or MODERATOR role' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/media/{id}': {
      get: {
        summary: 'Get media by ID',
        description: 'Retrieve media details by its unique identifier.',
        tags: ['Media'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The unique ID of the media item',
          },
        ],
        responses: {
          200: {
            description: 'Media retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MediaResponse',
                },
              },
            },
          },
          404: { description: 'Media not found' },
          400: { description: 'Invalid media ID' },
        },
      },
      put: {
        summary: 'Update media',
        description: 'Allows an admin or moderator to update media details.',
        tags: ['Media'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The unique ID of the media item',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MediaUpdate' },
            },
          },
        },
        responses: {
          200: { description: 'Media updated successfully' },
          400: { description: 'Invalid input data' },
          403: { description: 'Forbidden - Requires ADMIN or MODERATOR role' },
          404: { description: 'Media not found' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Delete media',
        description: 'Allows an admin to delete a media item.',
        tags: ['Media'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The unique ID of the media item',
          },
        ],
        responses: {
          200: { description: 'Media deleted successfully' },
          403: { description: 'Forbidden - Requires ADMIN role' },
          404: { description: 'Media not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
