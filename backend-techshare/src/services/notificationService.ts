import nodemailer from "nodemailer";
import { config } from "../config";
import { Server } from "socket.io";
import { Notification, INotification } from "../models/Notification";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { validateEmail } from "../utils/validators";
import { NotificationError, ValidationError } from "../utils/errors";

interface NotificationData {
  recipient: string;
  sender?: string;
  type: INotification["type"];
  title: string;
  message: string;
  relatedTool?: string;
  relatedRental?: string;
}

interface EmailData {
  title: string;
  message: string;
  details?: string;
  [key: string]: any;
}

interface PaginationResult {
  notifications: INotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class NotificationService {
  private transporter: nodemailer.Transporter;
  private io: Server;
  private userSockets: Map<string, string> = new Map();

  constructor(io: Server) {
    if (
      !config.email.host ||
      !config.email.port ||
      !config.email.user ||
      !config.email.password
    ) {
      throw new ValidationError("Configuration email incomplète");
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Nouvelle connexion socket: ${socket.id}`);

      socket.on("authenticate", async (token: string) => {
        try {
          if (!token) {
            throw new NotificationError("Token manquant", 401);
          }

          const user = await User.findOne({ token });
          if (!user) {
            throw new NotificationError("Utilisateur non trouvé", 401);
          }

          this.userSockets.set(user._id.toString(), socket.id);
          socket.join(`user:${user._id}`);
          logger.info(`Socket authentifié pour l'utilisateur: ${user._id}`);
        } catch (error) {
          logger.error("Erreur d'authentification du socket:", error);
          socket.emit("error", {
            message:
              error instanceof NotificationError
                ? error.message
                : "Erreur d'authentification",
            code: error instanceof NotificationError ? error.code : 500,
          });
        }
      });

      socket.on("markAsRead", async (notificationId: string) => {
        try {
          if (!notificationId) {
            throw new NotificationError("ID de notification manquant", 400);
          }

          const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
          );

          if (!notification) {
            throw new NotificationError("Notification non trouvée", 404);
          }

          socket.emit("notificationUpdated", notification);
        } catch (error) {
          logger.error(
            "Erreur lors du marquage de la notification comme lue:",
            error
          );
          socket.emit("error", {
            message:
              error instanceof NotificationError
                ? error.message
                : "Erreur lors du marquage",
            code: error instanceof NotificationError ? error.code : 500,
          });
        }
      });

      socket.on("disconnect", () => {
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            logger.info(`Socket déconnecté pour l'utilisateur: ${userId}`);
            break;
          }
        }
      });
    });
  }

  async createNotification(data: NotificationData): Promise<INotification> {
    try {
      // Validation des données
      if (!data.recipient) {
        throw new ValidationError("Destinataire requis");
      }
      if (!data.type) {
        throw new ValidationError("Type de notification requis");
      }
      if (!data.title || !data.message) {
        throw new ValidationError("Titre et message requis");
      }

      const notification = await Notification.create(data);

      // Envoyer la notification en temps réel
      const socketId = this.userSockets.get(data.recipient);
      if (socketId) {
        this.io.to(socketId).emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      logger.error("Erreur lors de la création de la notification:", error);
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors de la création de la notification",
            500
          );
    }
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginationResult> {
    try {
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError("Paramètres de pagination invalides");
      }

      const skip = (page - 1) * limit;
      const [notifications, total] = await Promise.all([
        Notification.find({ recipient: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("sender", "firstName lastName")
          .populate("relatedTool", "name")
          .populate("relatedRental", "status"),
        Notification.countDocuments({ recipient: userId }),
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
    } catch (error) {
      logger.error("Erreur lors de la récupération des notifications:", error);
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors de la récupération des notifications",
            500
          );
    }
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    try {
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      if (result.modifiedCount > 0) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
          this.io.to(socketId).emit("allNotificationsRead");
        }
      }

      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      logger.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors du marquage des notifications",
            500
          );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      return await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération du nombre de notifications non lues:",
        error
      );
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors de la récupération du nombre de notifications",
            500
          );
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: EmailData
  ): Promise<void> {
    try {
      if (!validateEmail(to)) {
        throw new ValidationError("Adresse email invalide");
      }

      if (!subject || !template) {
        throw new ValidationError("Sujet et template requis");
      }

      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html: this.renderTemplate(template, data),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email envoyé à ${to} avec le template ${template}`);
    } catch (error) {
      logger.error("Erreur lors de l'envoi de l'email:", error);
      throw error instanceof NotificationError
        ? error
        : new NotificationError("Erreur lors de l'envoi de l'email", 500);
    }
  }

  private renderTemplate(template: string, data: EmailData): string {
    try {
      // Templates de base pour différents types d'emails
      const templates: Record<string, (data: EmailData) => string> = {
        "rental-confirmation": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${
              data.details
                ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                : ""
            }
            <p style="color: #7f8c8d; font-size: 0.9em;">Merci de votre confiance !</p>
          </div>
        `,
        "payment-confirmation": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #27ae60;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${
              data.details
                ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                : ""
            }
            <p style="color: #7f8c8d; font-size: 0.9em;">Votre paiement a été traité avec succès.</p>
          </div>
        `,
        "return-reminder": (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e74c3c;">${data.title}</h1>
            <p style="color: #34495e;">${data.message}</p>
            ${
              data.details
                ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${data.details}</div>`
                : ""
            }
            <p style="color: #7f8c8d; font-size: 0.9em;">N'oubliez pas de retourner l'outil à temps !</p>
          </div>
        `,
      };

      const templateFn = templates[template];
      if (!templateFn) {
        throw new ValidationError(`Template '${template}' non trouvé`);
      }

      return templateFn(data);
    } catch (error) {
      logger.error("Erreur lors du rendu du template:", error);
      throw error instanceof NotificationError
        ? error
        : new NotificationError("Erreur lors du rendu du template", 500);
    }
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    try {
      if (!notificationId) {
        throw new ValidationError("ID de notification requis");
      }
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new NotificationError("Notification non trouvée", 404);
      }

      // Envoyer la mise à jour en temps réel
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.io.to(socketId).emit("notificationUpdated", notification);
      }

      return notification;
    } catch (error) {
      logger.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors du marquage de la notification comme lue",
            500
          );
    }
  }

  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      if (!notificationId) {
        throw new ValidationError("ID de notification requis");
      }
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new NotificationError("Notification non trouvée", 404);
      }

      // Envoyer la suppression en temps réel
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.io.to(socketId).emit("notificationDeleted", notificationId);
      }
    } catch (error) {
      logger.error("Erreur lors de la suppression de la notification:", error);
      throw error instanceof NotificationError
        ? error
        : new NotificationError(
            "Erreur lors de la suppression de la notification",
            500
          );
    }
  }
}

let notificationService: NotificationService;

export const initializeNotificationService = (
  io: Server
): NotificationService => {
  notificationService = new NotificationService(io);
  return notificationService;
};

export const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    throw new NotificationError(
      "NotificationService n'a pas été initialisé",
      500
    );
  }
  return notificationService;
};
