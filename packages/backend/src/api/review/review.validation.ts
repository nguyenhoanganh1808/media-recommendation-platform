import { body, param, query } from "express-validator";

export const reviewValidators = {
  create: [
    body("mediaId").isUUID().withMessage("Valid media ID is required"),
    body("content")
      .isString()
      .notEmpty()
      .withMessage("Review content is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Review content must be between 10 and 5000 characters"),
  ],

  update: [
    param("id").isUUID().withMessage("Invalid review ID"),
    body("content")
      .isString()
      .notEmpty()
      .withMessage("Review content is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Review content must be between 10 and 5000 characters"),
  ],

  toggleVisibility: [
    param("id").isUUID().withMessage("Invalid review ID"),
    body("isVisible")
      .isBoolean()
      .withMessage("isVisible must be a boolean value"),
  ],

  getById: [param("id").isUUID().withMessage("Invalid review ID")],

  getByMedia: [
    param("mediaId").isUUID().withMessage("Invalid media ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getByUser: [
    param("userId").isUUID().withMessage("Invalid user ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};
