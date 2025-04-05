// src/services/socket.service.ts
import { getSocketIO } from "../config/socket";
import { logger } from "../config/logger";
import { NotificationType } from "@prisma/client";

// Event types
export enum SocketEvent {
  NOTIFICATION = "notification",
  RATING_UPDATE = "rating:update",
  REVIEW_ADDED = "review:added",
  USER_FOLLOWED = "user:followed",
  LIST_SHARED = "list:shared",
  MEDIA_UPDATED = "media:updated",
  RECOMMENDATION = "recommendation",
  ONLINE_STATUS = "online:status",
}

// Send a notification to a specific user
export function sendUserNotification(
  userId: string,
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    createdAt: Date;
  }
) {
  try {
    const io = getSocketIO();
    io.to(`user:${userId}`).emit(SocketEvent.NOTIFICATION, notification);
    logger.debug(`Sent ${notification.type} notification to user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send socket notification: ${error}`);
    return false;
  }
}

// Notify about a new rating
export function notifyMediaRatingUpdate(
  mediaId: string,
  mediaTitle: string,
  newRating: number
) {
  try {
    const io = getSocketIO();
    io.emit(SocketEvent.RATING_UPDATE, {
      mediaId,
      mediaTitle,
      newAverageRating: newRating,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send rating update: ${error}`);
    return false;
  }
}

// Notify when a review is added
export function notifyNewReview(
  reviewerId: string,
  reviewerUsername: string,
  mediaId: string,
  mediaTitle: string,
  reviewId: string
) {
  try {
    const io = getSocketIO();
    io.emit(SocketEvent.REVIEW_ADDED, {
      reviewerId,
      reviewerUsername,
      mediaId,
      mediaTitle,
      reviewId,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send new review notification: ${error}`);
    return false;
  }
}

// Notify when someone is followed
export function notifyUserFollowed(
  followerId: string,
  followerUsername: string,
  followingId: string
) {
  try {
    const io = getSocketIO();
    io.to(`user:${followingId}`).emit(SocketEvent.USER_FOLLOWED, {
      followerId,
      followerUsername,
      timestamp: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send follow notification: ${error}`);
    return false;
  }
}

// Notify when a list is shared
export function notifyListShared(
  sharerId: string,
  sharerUsername: string,
  listId: string,
  listName: string,
  recipientIds: string[]
) {
  try {
    const io = getSocketIO();

    recipientIds.forEach((userId) => {
      io.to(`user:${userId}`).emit(SocketEvent.LIST_SHARED, {
        sharerId,
        sharerUsername,
        listId,
        listName,
        sharedAt: new Date(),
      });
    });

    return true;
  } catch (error) {
    logger.error(`Failed to send list shared notification: ${error}`);
    return false;
  }
}

// Notify about new recommendations
export function notifyNewRecommendation(
  userId: string,
  recommendationCount: number
) {
  try {
    const io = getSocketIO();
    io.to(`user:${userId}`).emit(SocketEvent.RECOMMENDATION, {
      count: recommendationCount,
      generatedAt: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send recommendation notification: ${error}`);
    return false;
  }
}

// Broadcast media updates (e.g., when new movie is added or updated)
export function broadcastMediaUpdate(
  mediaId: string,
  mediaTitle: string,
  mediaType: string,
  updateType: "new" | "update"
) {
  try {
    const io = getSocketIO();
    io.emit(SocketEvent.MEDIA_UPDATED, {
      mediaId,
      mediaTitle,
      mediaType,
      updateType,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to broadcast media update: ${error}`);
    return false;
  }
}

// Track online status of users
export function trackUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    const io = getSocketIO();
    io.emit(SocketEvent.ONLINE_STATUS, {
      userId,
      isOnline,
      timestamp: new Date(),
    });
    return true;
  } catch (error) {
    logger.error(`Failed to update online status: ${error}`);
    return false;
  }
}
