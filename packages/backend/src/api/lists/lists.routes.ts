import { Router } from 'express';
import * as listsController from './lists.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkOwnership } from '../../middlewares/auth.middleware';
import {
  validate,
  validateQueryParams,
} from '../../middlewares/validation.middleware';
import * as listsValidation from './lists.validation';
import { cacheMiddleware } from '../../middlewares/cache.middleware';

const router = Router();

// Apply authentication to all list routes
router.use(authenticate);

// Get all lists for the authenticated user
router.get(
  '/',
  validateQueryParams(['page', 'limit']),
  cacheMiddleware({ ttl: 300, keyPrefix: 'lists:user:' }),
  listsController.getUserLists
);

// Get a specific list by ID
router.get(
  '/:id',
  cacheMiddleware({ ttl: 300, keyPrefix: 'lists:single:' }),
  listsController.getListById
);

// Create a new list
router.post(
  '/',
  validate(listsValidation.createListValidation),
  listsController.createList
);

// Update a list
router.put(
  '/:id',
  validate(listsValidation.updateListValidation),
  checkOwnership('mediaList'),
  listsController.updateList
);

// Delete a list
router.delete('/:id', checkOwnership('mediaList'), listsController.deleteList);

// Add item to a list
router.post(
  '/:listId/items',
  validate(listsValidation.addItemValidation),
  checkOwnership('mediaList', 'listId'),
  listsController.addItemToList
);

// Update list item
router.put(
  '/items/:itemId',
  validate(listsValidation.updateItemValidation),
  checkOwnership('mediaListItem', 'itemId'),
  listsController.updateListItem
);

// Reorder list items
router.put(
  '/:listId/reorder',
  validate(listsValidation.reorderItemsValidation),
  checkOwnership('mediaList', 'listId'),
  listsController.reorderListItems
);

// Remove item from list
router.delete(
  '/items/:itemId',
  checkOwnership('mediaListItem', 'itemId'),
  listsController.removeItemFromList
);

// Get public lists from a user
router.get(
  '/user/:userId/public',
  cacheMiddleware({ ttl: 600, keyPrefix: 'lists:public:' }),
  listsController.getUserPublicLists
);

export default router;
