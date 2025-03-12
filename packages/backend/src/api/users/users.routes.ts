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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and follow system
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []  # Require admin authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Unauthorized - Only admins can create users
 */

router.post(
  '/',
  authenticate,
  validate(userValidation.createUserValidation),
  restrictTo(Role.ADMIN),
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: User not found
 */
// Protected routes
router.get(
  '/:id',
  authenticate,
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *       403:
 *         description: Unauthorized
 */
// Follow system routes
router.post(
  '/:id/follow',
  authenticate,
  validate(userValidation.followUserValidation),
  userController.followUser
);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       403:
 *         description: Unauthorized
 */
router.delete(
  '/:id/follow',
  authenticate,
  validate(userValidation.followUserValidation),
  userController.unfollowUser
);

/**
 * @swagger
 * /api/users/{id}/followers:
 *   get:
 *     summary: Get followers of a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of followers retrieved successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */
router.get(
  '/:id/followers',
  authenticate,
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUserFollowers
);

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     summary: Get following of a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of following retrieved successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */
router.get(
  '/:id/following',
  validate(userValidation.userIdValidation),
  userCacheMiddleware({ ttl: 300 }),
  userController.getUserFollowing
);

export default router;
