import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { logger } from "../config/logger";
import { NotificationType } from "@prisma/client";
import { config } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { title } from "process";

export class SocketService {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initializeMiddlewares();
    this.initializeHandlers();
    logger.info("Socket.IO service initialized");
  }

  private initializeMiddlewares() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          return next(new Error("Invalid token"));
        }
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user) {
          return next(new Error("User not found"));
        }

        // Attach user to socket
        socket.data.userId = user.id;
        socket.data.username = user.username;
        next();
      } catch (error) {
        logger.error("Socket authentication error:", error);
        next(new Error("Authentication error"));
      }
    });
  }

  private initializeHandlers() {
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;

      logger.info(`User connected: ${username} (${userId})`);

      // Join user to their private room
      socket.join(`user:${userId}`);

      // Handle disconnection
      socket.on("disconnect", () => {
        logger.info(`User disconnected: ${username} (${userId})`);
      });
    });
  }

  // Send notification to specific user
  public async sendNotification(
    userId: string,
    notification: {
      type: NotificationType;
      message: string;
      data?: any;
    }
  ) {
    try {
      // Save notification to database
      const savedNotification = await prisma.notification.create({
        data: {
          userId,
          title: notification.type,
          // Assuming title is the same as type for simplicity
          type: notification.type,
          message: notification.message,
          data: notification.data || {},
          isRead: false,
        },
      });

      // Emit to specific user's room
      this.io.to(`user:${userId}`).emit("notification", {
        id: savedNotification.id,
        title: savedNotification.title,
        type: savedNotification.type,
        message: savedNotification.message,
        data: savedNotification.data,
        createdAt: savedNotification.createdAt,
      });

      logger.debug(`Notification sent to user ${userId}`, {
        notificationId: savedNotification.id,
      });
      return savedNotification;
    } catch (error) {
      logger.error("Error sending notification:", error);
      throw error;
    }
  }

  // Send notification to multiple users
  public async broadcastNotification(
    userIds: string[],
    notification: {
      type: NotificationType;
      message: string;
      data?: any;
    }
  ) {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const savedNotification = await this.sendNotification(
          userId,
          notification
        );
        notifications.push(savedNotification);
      } catch (error) {
        logger.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notifications;
  }
}

let socketService: SocketService;

export const initializeSocketService = (server: http.Server): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error("Socket.IO service not initialized");
  }
  return socketService;
};
