"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const notificationSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le destinataire est requis"],
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tool",
    },
    relatedRental: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Rental",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Index pour la recherche rapide des notifications non lues
notificationSchema.index({ recipient: 1, isRead: 1 });
// Middleware pour logger les opérations
notificationSchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'une notification", {
        notificationId: this._id,
        recipientId: this.recipient,
        type: this.type,
        isRead: this.isRead,
    });
    next();
});
notificationSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'une notification", {
        notificationId: this._id,
        recipientId: this.recipient,
        type: this.type,
    });
    next();
});
const Notification = mongoose_1.default.model("Notification", notificationSchema);
exports.Notification = Notification;
//# sourceMappingURL=Notification.js.map