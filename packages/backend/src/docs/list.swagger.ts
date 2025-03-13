export const listsDocs = {
  tags: [
    {
      name: 'Lists',
      description: 'User media lists management',
    },
  ],
  components: {
    schemas: {
      List: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'list123' },
          name: { type: 'string', example: 'My Favorite Movies' },
          description: {
            type: 'string',
            example: 'A collection of my all-time favorite films',
            nullable: true,
          },
          isPublic: { type: 'boolean', example: true },
          userId: { type: 'string', example: 'user123' },
          itemCount: { type: 'integer', example: 12 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-15T08:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-02-20T14:20:00Z',
          },
        },
      },
      ListWithItems: {
        type: 'object',
        allOf: [
          { $ref: '#/components/schemas/List' },
          {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'item123' },
                    mediaId: { type: 'string', example: 'media456' },
                    notes: {
                      type: 'string',
                      example: 'Watched this three times already!',
                      nullable: true,
                    },
                    order: { type: 'integer', example: 2 },
                    media: { $ref: '#/components/schemas/Media' },
                  },
                },
              },
            },
          },
        ],
      },
      ListCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'My Favorite Movies',
            minLength: 1,
            maxLength: 100,
          },
          description: {
            type: 'string',
            example: 'A collection of my all-time favorite films',
            maxLength: 500,
          },
          isPublic: { type: 'boolean', example: false },
        },
      },
      ListUpdate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'My Updated List Name',
            minLength: 1,
            maxLength: 100,
          },
          description: {
            type: 'string',
            example: 'Updated description for my list',
            maxLength: 500,
          },
          isPublic: { type: 'boolean', example: true },
        },
      },
      ListItemAdd: {
        type: 'object',
        required: ['mediaId'],
        properties: {
          mediaId: { type: 'string', example: 'media789' },
          notes: {
            type: 'string',
            example: 'Great film, would recommend!',
            maxLength: 500,
          },
        },
      },
      ListItemUpdate: {
        type: 'object',
        properties: {
          notes: {
            type: 'string',
            example: 'Updated notes after rewatching',
            maxLength: 500,
          },
        },
      },
      ListItemsReorder: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'order'],
              properties: {
                id: { type: 'string', example: 'item123' },
                order: { type: 'integer', example: 3, minimum: 0 },
              },
            },
          },
        },
      },
      ListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Lists retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/List' },
          },
          meta: {
            type: 'object',
            properties: {
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
          responseTime: { type: 'string', example: '45ms' },
        },
      },
      SingleListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'List retrieved successfully' },
          data: { $ref: '#/components/schemas/ListWithItems' },
          responseTime: { type: 'string', example: '65ms' },
        },
      },
    },
  },
  paths: {
    '/api/lists': {
      get: {
        summary: 'Get all lists for authenticated user',
        description:
          'Retrieves all lists belonging to the currently authenticated user',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
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
            description: 'Number of lists per page (default: 10)',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Lists retrieved successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListResponse' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create a new list',
        description: 'Creates a new media list for the authenticated user',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'List created successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SingleListResponse' },
              },
            },
          },
          400: { description: 'Invalid input data' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/lists/{id}': {
      get: {
        summary: 'Get a list by ID',
        description:
          'Retrieve a specific list by its ID. User must own the list or the list must be public',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list to retrieve',
          },
        ],
        responses: {
          200: {
            description: 'List retrieved successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SingleListResponse' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: {
            description:
              'Forbidden - User does not have permission to view this list',
          },
          404: { description: 'List not found' },
        },
      },
      put: {
        summary: 'Update a list',
        description: "Update a list's details. User must own the list",
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list to update',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'List updated successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SingleListResponse' },
              },
            },
          },
          400: { description: 'Invalid input data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - User does not own this list' },
          404: { description: 'List not found' },
        },
      },
      delete: {
        summary: 'Delete a list',
        description: 'Delete a list. User must own the list',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list to delete',
          },
        ],
        responses: {
          200: {
            description: 'List deleted successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'List deleted successfully',
                    },
                    data: { type: 'null' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - User does not own this list' },
          404: { description: 'List not found' },
        },
      },
    },
    '/api/lists/{listId}/items': {
      post: {
        summary: 'Add an item to a list',
        description: 'Add a media item to a list. User must own the list',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list to add an item to',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListItemAdd' },
            },
          },
        },
        responses: {
          201: {
            description: 'Item added to list successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Item added to list successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'item123' },
                        listId: { type: 'string', example: 'list456' },
                        mediaId: { type: 'string', example: 'media789' },
                        notes: { type: 'string', example: 'Great movie!' },
                        order: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - User does not own this list' },
          404: { description: 'List or media not found' },
          409: { description: 'Item already exists in this list' },
        },
      },
    },
    '/api/lists/{listId}/reorder': {
      put: {
        summary: 'Reorder list items',
        description: 'Reorder items within a list. User must own the list',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list to reorder items for',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListItemsReorder' },
            },
          },
        },
        responses: {
          200: {
            description: 'List items reordered successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'List items reordered successfully',
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'item123' },
                          order: { type: 'integer', example: 3 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - User does not own this list' },
          404: { description: 'List not found' },
        },
      },
    },
    '/api/lists/items/{itemId}': {
      put: {
        summary: 'Update a list item',
        description:
          'Update notes for a list item. User must own the list containing the item',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list item to update',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListItemUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'List item updated successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'List item updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'item123' },
                        notes: {
                          type: 'string',
                          example: 'Updated notes for this movie',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input data' },
          401: { description: 'Unauthorized' },
          403: {
            description:
              'Forbidden - User does not own the list containing this item',
          },
          404: { description: 'List item not found' },
        },
      },
      delete: {
        summary: 'Remove an item from a list',
        description:
          'Remove an item from a list. User must own the list containing the item',
        tags: ['Lists'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the list item to remove',
          },
        ],
        responses: {
          200: {
            description: 'Item removed from list successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Item removed from list successfully',
                    },
                    data: { type: 'null' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: {
            description:
              'Forbidden - User does not own the list containing this item',
          },
          404: { description: 'List item not found' },
        },
      },
    },
    '/api/lists/user/{userId}/public': {
      get: {
        summary: 'Get public lists from a user',
        description: 'Retrieve public lists belonging to a specific user',
        tags: ['Lists'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the user whose public lists to retrieve',
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination (default: 1)',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of lists per page (default: 10)',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Public lists retrieved successfully',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description:
                  'Time taken to process the request in milliseconds',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListResponse' },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
    },
  },
};
