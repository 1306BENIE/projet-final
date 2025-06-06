"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.notificationValidation = {
    getUserNotifications: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1).messages({
            "number.base": "Le numéro de page doit être un nombre",
            "number.integer": "Le numéro de page doit être un entier",
            "number.min": "Le numéro de page doit être supérieur à 0",
        }),
        limit: joi_1.default.number().integer().min(1).max(100).default(20).messages({
            "number.base": "La limite doit être un nombre",
            "number.integer": "La limite doit être un entier",
            "number.min": "La limite doit être supérieure à 0",
            "number.max": "La limite ne peut pas dépasser 100",
        }),
    }),
    markAsRead: joi_1.default.object({
        id: joi_1.default.string()
            .required()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .messages({
            "string.empty": "L'ID de la notification est requis",
            "any.required": "L'ID de la notification est requis",
            "string.pattern.base": "L'ID de la notification n'est pas valide",
        }),
    }),
    deleteNotification: joi_1.default.object({
        id: joi_1.default.string()
            .required()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .messages({
            "string.empty": "L'ID de la notification est requis",
            "any.required": "L'ID de la notification est requis",
            "string.pattern.base": "L'ID de la notification n'est pas valide",
        }),
    }),
};
//# sourceMappingURL=notificationValidation.js.map