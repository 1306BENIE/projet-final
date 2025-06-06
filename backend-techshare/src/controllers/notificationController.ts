import { Request, Response } from "express";
import { NotificationError, ValidationError } from "../utils/errors";
import { getNotificationService } from "../services/notificationService";

export const notificationController = {
  // Get user's notifications
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getNotificationService().getUserNotifications(
      req.user.userId,
      page,
      limit
    );

    res.json(result);
  },

  // Get unread notifications
  async getUnreadNotifications(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getNotificationService().getUserNotifications(
      req.user.userId,
      page,
      limit
    );

    res.json({
      ...result,
      notifications: result.notifications.filter((n) => !n.isRead),
    });
  },

  // Mark notification as read
  async markAsRead(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const { id } = req.params;
    if (!id) {
      throw new ValidationError("ID de notification requis");
    }

    const notification = await getNotificationService().markAsRead(
      id,
      req.user.userId
    );

    res.json({ message: "Notification marquée comme lue", notification });
  },

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const result = await getNotificationService().markAllAsRead(
      req.user.userId
    );

    res.json({
      message: "Toutes les notifications ont été marquées comme lues",
      modifiedCount: result.modifiedCount,
    });
  },

  // Delete notification
  async deleteNotification(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const { id } = req.params;
    if (!id) {
      throw new ValidationError("ID de notification requis");
    }

    await getNotificationService().deleteNotification(id, req.user.userId);

    res.json({ message: "Notification supprimée avec succès" });
  },

  // Get unread notifications count
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    if (!req.user?.userId) {
      throw new NotificationError("Non autorisé", 401);
    }

    const count = await getNotificationService().getUnreadCount(
      req.user.userId
    );

    res.json({ count });
  },
};
