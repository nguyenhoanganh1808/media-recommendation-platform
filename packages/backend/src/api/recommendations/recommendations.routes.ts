// src/api/recommendations/recommendations.routes.ts
import { Router } from 'express';
import * as recommendationsController from './recommendations.controller';
import { authenticate, restrictTo } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  getRecommendationsValidation,
  getMediaBasedRecommendationsValidation,
  updateUserPreferencesValidation,
} from './recommendations.validation';
import { Role } from '@prisma/client';
import { userCacheMiddleware } from '../../middlewares/cache.middleware';

const router = Router();

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized recommendations for authenticated user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validate(getRecommendationsValidation),
  userCacheMiddleware({ ttl: 3600 }), // Cache for 1 hour
  recommendationsController.getRecommendations
);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending media recommendations
 * @access  Public
 */
router.get(
  '/trending',
  validate(getRecommendationsValidation),
  userCacheMiddleware({
    ttl: 1800,
    cacheCondition: () => true, // Cache for both auth and non-auth users
  }),
  recommendationsController.getTrendingRecommendations
);

/**
 * @route   GET /api/recommendations/media/:mediaId
 * @desc    Get recommendations based on a specific media item
 * @access  Private
 */
router.get(
  '/media/:mediaId',
  authenticate,
  validate(getMediaBasedRecommendationsValidation),
  userCacheMiddleware({ ttl: 3600 }),
  recommendationsController.getMediaBasedRecommendations
);

/**
 * @route   PUT /api/recommendations/preferences/:userId
 * @desc    Update user preference settings for recommendations
 * @access  Private - User or Admin only
 */
router.put(
  '/preferences/:userId',
  authenticate,
  restrictTo(Role.USER, Role.ADMIN),
  validate(updateUserPreferencesValidation),
  recommendationsController.updateUserPreferences
);

export default router;
