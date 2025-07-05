"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePayment = exports.getPaymentHistorySchema = exports.getPaymentIntentSchema = exports.webhookSchema = exports.refundPaymentSchema = exports.createPaymentIntentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
exports.createPaymentIntentSchema = joi_1.default.object({
    amount: joi_1.default.number().required().min(1).messages({
        "number.base": "Le montant doit être un nombre",
        "number.min": "Le montant doit être supérieur à 0",
        "any.required": "Le montant est requis",
    }),
    currency: joi_1.default.string().default("xof").valid("eur", "usd", "xof").messages({
        "string.base": "La devise doit être une chaîne de caractères",
        "any.only": "La devise doit être 'eur', 'usd' ou 'xof' (FCFA)",
    }),
    rentalId: joi_1.default.string().required().messages({
        "string.empty": "L'ID de la location est requis",
        "any.required": "L'ID de la location est requis",
    }),
    paymentMethodId: joi_1.default.string().required().messages({
        "string.empty": "L'ID de la méthode de paiement est requis",
        "any.required": "L'ID de la méthode de paiement est requis",
    }),
});
exports.refundPaymentSchema = joi_1.default.object({
    paymentIntentId: joi_1.default.string().required().messages({
        "string.empty": "L'ID du paiement est requis",
        "any.required": "L'ID du paiement est requis",
    }),
    amount: joi_1.default.number().min(0).messages({
        "number.base": "Le montant doit être un nombre",
        "number.min": "Le montant ne peut pas être négatif",
    }),
    reason: joi_1.default.string().messages({
        "string.base": "La raison doit être une chaîne de caractères",
    }),
});
exports.webhookSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    type: joi_1.default.string().required(),
    data: joi_1.default.object().required(),
    created: joi_1.default.number().required(),
});
exports.getPaymentIntentSchema = joi_1.default.object({
    paymentIntentId: joi_1.default.string().required().messages({
        "string.empty": "L'ID du paiement est requis",
        "any.required": "L'ID du paiement est requis",
    }),
});
exports.getPaymentHistorySchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1).messages({
        "number.base": "La page doit être un nombre",
        "number.min": "La page doit être supérieure à 0",
    }),
    limit: joi_1.default.number().min(1).max(100).default(20).messages({
        "number.base": "La limite doit être un nombre",
        "number.min": "La limite doit être supérieure à 0",
        "number.max": "La limite ne peut pas dépasser 100",
    }),
});
const validatePayment = (req, res, next) => {
    try {
        const schema = req.path.includes("refund")
            ? exports.refundPaymentSchema
            : exports.createPaymentIntentSchema;
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path[0],
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation de paiement:", { errors });
            return res.status(400).json({ errors });
        }
        return next();
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la validation de paiement:", error);
        return res.status(500).json({
            message: "Erreur lors de la validation des données",
        });
    }
};
exports.validatePayment = validatePayment;
//# sourceMappingURL=paymentValidation.js.map