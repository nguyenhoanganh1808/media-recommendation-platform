// src/api/ratings/ratings.routes.ts
import { Router } from 'express';
import * as ratingsController from './ratings.controller';
import {
  authenticate,
  checkOwnership,
  restrictTo,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  createRatingValidation,
  deleteRatingValidation,
  getMediaRatingsValidation,
  getRatingValidation,
  getUserRatingsValidation,
  updateRatingValidation,
} from './ratings.validation';
import { userCacheMiddleware } from '../../middlewares/cache.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create a new rating
router.post(
  '/',
  validate(createRatingValidation),
  ratingsController.createRating
);

// Get ratings for authenticated user
router.get(
  '/me',
  userCacheMiddleware({ ttl: 300 }),
  ratingsController.getUserRatings
);

// Get ratings for a specific user
router.get(
  '/user/:userId',
  validate(getUserRatingsValidation),
  userCacheMiddleware({ ttl: 300 }),
  ratingsController.getUserRatings
);

// Get ratings for a specific media
router.get(
  '/media/:mediaId',
  validate(getMediaRatingsValidation),
  userCacheMiddleware({ ttl: 300 }),
  ratingsController.getMediaRatings
);

// Get a specific rating
router.get(
  '/:id',
  validate(getRatingValidation),
  userCacheMiddleware({ ttl: 300 }),
  ratingsController.getRating
);

// Update a rating
router.put(
  '/:id',
  validate(updateRatingValidation),
  ratingsController.updateRating
);

// Delete a rating
router.delete(
  '/:id',
  validate(deleteRatingValidation),
  checkOwnership('mediaRating', 'id'),
  ratingsController.deleteRating
);

// Admin route to force delete a rating
router.delete(
  '/admin/:id',
  validate(deleteRatingValidation),
  restrictTo(Role.ADMIN, Role.MODERATOR),
  ratingsController.deleteRating
);

export default router;
