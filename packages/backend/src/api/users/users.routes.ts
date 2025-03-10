// src/api/users/users.routes.ts
import { Router } from 'express';
import * as userController from './users.controller';
import * as userValidation from './users.validation';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate, restrictTo } from '../../middlewares/auth.middleware';
import { userCacheMiddleware } from '../../middlewares/cache.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.post(
  '/',
  validate(userValidation.createUserValidation),
  userController.createUser
);

// Protected routes
router.get(
  '/:id',
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  userController.getUser
);

router.patch(
  '/:id',
  authenticate,
  validate([
    ...userValidation.userIdValidation,
    ...userValidation.updateUserValidation,
  ]),
  userController.updateUser
);

// Admin-only routes
router.delete(
  '/:id',
  authenticate,
  restrictTo(Role.ADMIN),
  validate(userValidation.userIdValidation),
  (req, res) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

// Follow system routes
router.post(
  '/:id/follow',
  authenticate,
  validate(userValidation.followUserValidation),
  userController.followUser
);

router.delete(
  '/:id/follow',
  authenticate,
  validate(userValidation.followUserValidation),
  userController.unfollowUser
);

router.get(
  '/:id/followers',
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUserFollowers
);

router.get(
  '/:id/following',
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUserFollowing
);

export default router;
