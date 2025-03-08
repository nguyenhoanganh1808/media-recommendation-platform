import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(registerValidator),
  authController.register
);
router.post(
  '/login',
  authLimiter,
  validate(loginValidator),
  authController.login
);
router.post(
  '/refresh-token',
  validate(refreshTokenValidator),
  authController.refreshToken
);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  authController.changePassword
);
router.get('/profile', authenticate, authController.getProfile);

export default router;
