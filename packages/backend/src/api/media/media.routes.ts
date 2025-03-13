// media.routes.ts
import { Router } from 'express';
import { authenticate, restrictTo } from '../../middlewares/auth.middleware';
import {
  validate,
  validateQueryParams,
} from '../../middlewares/validation.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware';
import * as mediaController from './media.controller';
import * as mediaValidation from './media.validation';
import { Role } from '@prisma/client';

const router = Router();

// Public routes

router.get(
  '/',
  validateQueryParams([
    'page',
    'limit',
    'type',
    'genre',
    'search',
    'sortBy',
    'sortOrder',
  ]),
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  rateLimiter,
  validate(mediaValidation.getAllMediaValidation),
  mediaController.getAllMedia
);

router.get(
  '/:id',
  cacheMiddleware({ ttl: 300 }),
  rateLimiter,
  validate(mediaValidation.getMediaByIdValidation),
  mediaController.getMediaById
);

// Protected routes (admin/moderator only)
router.post(
  '/',
  authenticate,
  restrictTo(Role.ADMIN, Role.MODERATOR),
  validate(mediaValidation.createMediaValidation),
  mediaController.createMedia
);

router.put(
  '/:id',
  authenticate,
  restrictTo(Role.ADMIN, Role.MODERATOR),
  validate(mediaValidation.updateMediaValidation),
  mediaController.updateMedia
);

router.delete(
  '/:id',
  authenticate,
  restrictTo(Role.ADMIN),
  validate(mediaValidation.deleteMediaValidation),
  mediaController.deleteMedia
);

export default router;
