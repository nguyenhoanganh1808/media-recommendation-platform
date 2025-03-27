import { Router } from "express";
import * as notificationController from "./notifications.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { userCacheMiddleware } from "../../middlewares/cache.middleware";
import { rateLimiter } from "../../middlewares/rateLimiter.middleware";
import {
  deleteNotificationValidation,
  getNotificationsValidation,
  markAsReadValidation,
  updateNotificationSettingsValidation,
} from "./notifications.validation";

const router = Router();

router.use(authenticate);
router.use(rateLimiter);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get(
  "/",
  validate(getNotificationsValidation),
  userCacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  notificationController.getUserNotifications
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch(
  "/:id/read",
  validate(markAsReadValidation),
  notificationController.markAsRead
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/read", notificationController.deleteAllReadNotifications);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
  "/:id",
  validate(deleteNotificationValidation),
  notificationController.deleteNotification
);

/**
 * @route   GET /api/notifications/settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get("/settings", notificationController.getNotificationSettings);

/**
 * @route   PUT /api/notifications/settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put(
  "/settings",
  validate(updateNotificationSettingsValidation),
  notificationController.updateNotificationSettings
);

export default router;
