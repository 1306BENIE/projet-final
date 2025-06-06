"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReviewParams = exports.validateReview = exports.reviewParamsSchema = exports.reviewSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
exports.reviewSchema = joi_1.default.object({
    toolId: joi_1.default.string().required().messages({
        "string.empty": "L'ID de l'outil est requis",
        "any.required": "L'ID de l'outil est requis",
    }),
    rentalId: joi_1.default.string().required().messages({
        "string.empty": "L'ID de la location est requis",
        "any.required": "L'ID de la location est requis",
    }),
    rating: joi_1.default.number().min(1).max(5).required().messages({
        "number.base": "La note doit être un nombre",
        "number.min": "La note doit être au minimum 1",
        "number.max": "La note doit être au maximum 5",
        "any.required": "La note est requise",
    }),
    comment: joi_1.default.string().min(10).max(500).required().messages({
        "string.empty": "Le commentaire est requis",
        "string.min": "Le commentaire doit faire au moins 10 caractères",
        "string.max": "Le commentaire ne doit pas dépasser 500 caractères",
        "any.required": "Le commentaire est requis",
    }),
});
exports.reviewParamsSchema = joi_1.default.object({
    reviewId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
        "string.pattern.base": "L'ID de l'avis n'est pas valide",
    }),
    toolId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
        "string.pattern.base": "L'ID de l'outil n'est pas valide",
    }),
    userId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
        "string.pattern.base": "L'ID de l'utilisateur n'est pas valide",
    }),
});
const validateReview = (req, _res, next) => {
    try {
        const { error } = exports.reviewSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: String(detail.path[0]),
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation d'avis:", { errors });
            throw new errors_1.ValidationError("Données d'avis invalides", errors);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateReview = validateReview;
const validateReviewParams = (req, _res, next) => {
    try {
        const { error } = exports.reviewParamsSchema.validate(req.params, {
            abortEarly: false,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: String(detail.path[0]),
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation des paramètres d'avis:", { errors });
            throw new errors_1.ValidationError("Paramètres d'avis invalides", errors);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateReviewParams = validateReviewParams;
//# sourceMappingURL=reviewValidation.js.map