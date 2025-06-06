"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const errors_1 = require("../utils/errors");
const notificationService_1 = require("../services/notificationService");
exports.notificationController = {
    // Get user's notifications
    async getUserNotifications(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await (0, notificationService_1.getNotificationService)().getUserNotifications(req.user.userId, page, limit);
        res.json(result);
    },
    // Get unread notifications
    async getUnreadNotifications(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await (0, notificationService_1.getNotificationService)().getUserNotifications(req.user.userId, page, limit);
        res.json({
            ...result,
            notifications: result.notifications.filter((n) => !n.isRead),
        });
    },
    // Mark notification as read
    async markAsRead(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const { id } = req.params;
        if (!id) {
            throw new errors_1.ValidationError("ID de notification requis");
        }
        const notification = await (0, notificationService_1.getNotificationService)().markAsRead(id, req.user.userId);
        res.json({ message: "Notification marquée comme lue", notification });
    },
    // Mark all notifications as read
    async markAllAsRead(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const result = await (0, notificationService_1.getNotificationService)().markAllAsRead(req.user.userId);
        res.json({
            message: "Toutes les notifications ont été marquées comme lues",
            modifiedCount: result.modifiedCount,
        });
    },
    // Delete notification
    async deleteNotification(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const { id } = req.params;
        if (!id) {
            throw new errors_1.ValidationError("ID de notification requis");
        }
        await (0, notificationService_1.getNotificationService)().deleteNotification(id, req.user.userId);
        res.json({ message: "Notification supprimée avec succès" });
    },
    // Get unread notifications count
    async getUnreadCount(req, res) {
        if (!req.user?.userId) {
            throw new errors_1.NotificationError("Non autorisé", 401);
        }
        const count = await (0, notificationService_1.getNotificationService)().getUnreadCount(req.user.userId);
        res.json({ count });
    },
};
//# sourceMappingURL=notificationController.js.map