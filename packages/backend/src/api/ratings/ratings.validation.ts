import { body, param } from "express-validator";

export const createRatingValidation = [
  body("mediaId").isUUID().withMessage("Valid media ID is required"),
  body("rating")
    .isFloat({ min: 1, max: 10 })
    .withMessage("Rating must be a number between 1 and 10"),
];

export const updateRatingValidation = [
  param("id").isUUID().withMessage("Valid rating ID is required"),
  body("rating")
    .isFloat({ min: 1, max: 10 })
    .withMessage("Rating must be a number between 1 and 10"),
];

export const deleteRatingValidation = [
  param("id").isUUID().withMessage("Valid rating ID is required"),
];

export const getRatingValidation = [
  param("id").isUUID().withMessage("Valid rating ID is required"),
];

export const getMediaRatingsValidation = [
  param("mediaId").isUUID().withMessage("Valid media ID is required"),
];

export const getUserRatingsValidation = [
  param("userId").isUUID().withMessage("Valid user ID is required"),
];
