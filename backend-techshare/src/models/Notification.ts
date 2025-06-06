import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { INotification } from "../interfaces/notification.interface";

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le destinataire est requis"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "rental_request",
        "rental_accepted",
        "rental_rejected",
        "rental_completed",
        "review_received",
        "payment_received",
        "system",
      ],
      required: [true, "Le type de notification est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Le message est requis"],
      trim: true,
    },
    relatedTool: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
    },
    relatedRental: {
      type: Schema.Types.ObjectId,
      ref: "Rental",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche rapide des notifications non lues
notificationSchema.index({ recipient: 1, isRead: 1 });

// Middleware pour logger les opérations
notificationSchema.pre(
  "save",
  function (
    this: INotification,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Sauvegarde d'une notification", {
      notificationId: this._id,
      recipientId: this.recipient,
      type: this.type,
      isRead: this.isRead,
    });
    next();
  }
);

notificationSchema.pre(
  "deleteOne",
  function (
    this: INotification,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Suppression d'une notification", {
      notificationId: this._id,
      recipientId: this.recipient,
      type: this.type,
    });
    next();
  }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export { Notification, INotification };
