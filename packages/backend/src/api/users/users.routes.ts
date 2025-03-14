// src/api/users/users.routes.ts
import { Router } from 'express';
import * as userController from './users.controller';
import * as userValidation from './users.validation';
import { validate } from '../../middlewares/validation.middleware';
import {
  authenticate,
  checkOwnership,
  restrictTo,
} from '../../middlewares/auth.middleware';
import { userCacheMiddleware } from '../../middlewares/cache.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  restrictTo(Role.ADMIN),
  validate(userValidation.createUserValidation),
  userController.createUser
);

// Protected routes
router.get(
  '/:id',
  authenticate,
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUser
);

router.patch(
  '/:id',
  authenticate,
  // checkOwnership('user', 'id'),
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
  authenticate,
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
