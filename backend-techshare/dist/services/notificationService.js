"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationService = exports.initializeNotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const validators_1 = require("../utils/validators");
const errors_1 = require("../utils/errors");
class NotificationService {
    constructor(io) {
        this.userSockets = new Map();
        if (!config_1.config.email.host ||
            !config_1.config.email.port ||
            !config_1.config.email.user ||
            !config_1.config.email.password) {
            throw new errors_1.ValidationError("Configuration email incomplète");
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.config.email.host,
            port: config_1.config.email.port,
            secure: config_1.config.email.secure,
            auth: {
                user: config_1.config.email.user,
                pass: config_1.config.email.password,
            },
        });
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on("connection", (socket) => {
            logger_1.logger.info(`Nouvelle connexion socket: ${socket.id}`);
            socket.on("authenticate", async (token) => {
                try {
                    if (!token) {
                        throw new errors_1.NotificationError("Token manquant", 401);
                    }
                    const user = await User_1.User.findOne({ token });
                    if (!user) {
                        throw new errors_1.NotificationError("Utilisateur non trouvé", 401);
                    }
                    this.userSockets.set(user._id.toString(), socket.id);
                    socket.join(`user:${user._id}`);
                    logger_1.logger.info(`Socket authentifié pour l'utilisateur: ${user._id}`);
                }
                catch (error) {
                    logger_1.logger.error("Erreur d'authentification du socket:", error);
                    socket.emit("error", {
                        message: error instanceof errors_1.NotificationError
                            ? error.message
                            : "Erreur d'authentification",
                        code: error instanceof errors_1.NotificationError ? error.code : 500,
                    });
                }
            });
            socket.on("markAsRead", async (notificationId) => {
                try {
                    if (!notificationId) {
                        throw new errors_1.NotificationError("ID de notification manquant", 400);
                    }
                    const notification = await Notification_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
                    if (!notification) {
                        throw new errors_1.NotificationError("Notification non trouvée", 404);
                    }
                    socket.emit("notificationUpdated", notification);
                }
                catch (error) {
                    logger_1.logger.error("Erreur lors du marquage de la notification comme lue:", error);
                    socket.emit("error", {
                        message: error instanceof errors_1.NotificationError
                            ? error.message
                            : "Erreur lors du marquage",
                        code: error instanceof errors_1.NotificationError ? error.code : 500,
                    });
                }
            });
            socket.on("disconnect", () => {
                for (const [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        logger_1.logger.info(`Socket déconnecté pour l'utilisateur: ${userId}`);
                        break;
                    }
                }
            });
        });
    }
    async createNotification(data) {
        try {
            if (!data.recipient) {
                throw new errors_1.ValidationError("Destinataire requis");
            }
            if (!data.type) {
                throw new errors_1.ValidationError("Type de notification requis");
            }
            if (!data.title || !data.message) {
                throw new errors_1.ValidationError("Titre et message requis");
            }
            const notification = await Notification_1.Notification.create(data);
            const socketId = this.userSockets.get(data.recipient);
            if (socketId) {
                this.io.to(socketId).emit("newNotification", notification);
            }
            return notification;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la création de la notification:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors de la création de la notification", 500);
        }
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            if (page < 1 || limit < 1 || limit > 100) {
                throw new errors_1.ValidationError("Paramètres de pagination invalides");
            }
            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                Notification_1.Notification.find({ recipient: userId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("sender", "firstName lastName")
                    .populate("relatedTool", "name")
                    .populate("relatedRental", "status"),
                Notification_1.Notification.countDocuments({ recipient: userId }),
            ]);
            return {
                notifications,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération des notifications:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors de la récupération des notifications", 500);
        }
    }
    async markAllAsRead(userId) {
        try {
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            const result = await Notification_1.Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
            if (result.modifiedCount > 0) {
                const socketId = this.userSockets.get(userId);
                if (socketId) {
                    this.io.to(socketId).emit("allNotificationsRead");
                }
            }
            return { modifiedCount: result.modifiedCount };
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors du marquage des notifications", 500);
        }
    }
    async getUnreadCount(userId) {
        try {
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            return await Notification_1.Notification.countDocuments({
                recipient: userId,
                isRead: false,
            });
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération du nombre de notifications non lues:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors de la récupération du nombre de notifications", 500);
        }
    }
    async sendEmail(to, subject, template, data) {
        try {
            if (!(0, validators_1.validateEmail)(to)) {
                throw new errors_1.ValidationError("Adresse email invalide");
            }
            if (!subject || !template) {
                throw new errors_1.ValidationError("Sujet et template requis");
            }
            const mailOptions = {
                from: config_1.config.email.from,
                to,
                subject,
                html: this.renderTemplate(template, data),
            };
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email envoyé à ${to} avec le template ${template}`);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'envoi de l'email:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors de l'envoi de l'email", 500);
        }
    }
    renderTemplate(template, data) {
        try {
            const templates = {
                "rental-confirmation": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${data.details
                    ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                    : ""}
            <p style="color: #7f8c8d; font-size: 0.9em;">Merci de votre confiance !</p>
          </div>
        `,
                "payment-confirmation": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #27ae60;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${data.details
                    ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                    : ""}
            <p style="color: #7f8c8d; font-size: 0.9em;">Votre paiement a été traité avec succès.</p>
          </div>
        `,
                "return-reminder": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e74c3c;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${data.details
                    ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                    : ""}
            <p style="color: #7f8c8d; font-size: 0.9em;">N'oubliez pas de retourner l'outil à temps !</p>
          </div>
        `,
            };
            const templateFn = templates[template];
            if (!templateFn) {
                throw new errors_1.ValidationError(`Template '${template}' non trouvé`);
            }
            return templateFn(data);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du rendu du template:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors du rendu du template", 500);
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            if (!notificationId) {
                throw new errors_1.ValidationError("ID de notification requis");
            }
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            const notification = await Notification_1.Notification.findOneAndUpdate({ _id: notificationId, recipient: userId }, { isRead: true }, { new: true });
            if (!notification) {
                throw new errors_1.NotificationError("Notification non trouvée", 404);
            }
            const socketId = this.userSockets.get(userId);
            if (socketId) {
                this.io.to(socketId).emit("notificationUpdated", notification);
            }
            return notification;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du marquage de la notification comme lue:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors du marquage de la notification comme lue", 500);
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            if (!notificationId) {
                throw new errors_1.ValidationError("ID de notification requis");
            }
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            const notification = await Notification_1.Notification.findOneAndDelete({
                _id: notificationId,
                recipient: userId,
            });
            if (!notification) {
                throw new errors_1.NotificationError("Notification non trouvée", 404);
            }
            const socketId = this.userSockets.get(userId);
            if (socketId) {
                this.io.to(socketId).emit("notificationDeleted", notificationId);
            }
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la suppression de la notification:", error);
            throw error instanceof errors_1.NotificationError
                ? error
                : new errors_1.NotificationError("Erreur lors de la suppression de la notification", 500);
        }
    }
}
let notificationService;
const initializeNotificationService = (io) => {
    notificationService = new NotificationService(io);
    return notificationService;
};
exports.initializeNotificationService = initializeNotificationService;
const getNotificationService = () => {
    if (!notificationService) {
        throw new errors_1.NotificationError("NotificationService n'a pas été initialisé", 500);
    }
    return notificationService;
};
exports.getNotificationService = getNotificationService;
//# sourceMappingURL=notificationService.js.map