import { Router } from 'express';
import authController from './auth.controller';
import { validate } from '../../middlewares/validation.middleware';
import authValidation from './auth.validation';
import {
  authenticate,
  authenticateRefreshToken,
  updateLastLogin,
} from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(authValidation.registerValidation),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(authValidation.loginValidation),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  validate(authValidation.logoutValidation),
  authController.logout
);

router.post(
  '/refresh-token',
  authenticateRefreshToken,
  validate(authValidation.refreshTokenValidation),
  authController.refreshToken
);

router.get(
  '/profile',
  authenticate,
  updateLastLogin,
  authController.getProfile
);

router.post(
  '/change-password',
  authenticate,
  validate(authValidation.changePasswordValidation),
  authController.changePassword
);

export default router;
