"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategory = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
exports.createCategorySchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(50).messages({
        "string.empty": "Le nom de la catégorie est requis",
        "string.min": "Le nom de la catégorie doit faire au moins 2 caractères",
        "string.max": "Le nom de la catégorie ne doit pas dépasser 50 caractères",
        "any.required": "Le nom de la catégorie est requis",
    }),
    description: joi_1.default.string().required().min(10).max(500).messages({
        "string.empty": "La description est requise",
        "string.min": "La description doit faire au moins 10 caractères",
        "string.max": "La description ne doit pas dépasser 500 caractères",
        "any.required": "La description est requise",
    }),
    icon: joi_1.default.string().required().messages({
        "string.empty": "L'icône est requise",
        "any.required": "L'icône est requise",
    }),
});
exports.updateCategorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).messages({
        "string.min": "Le nom de la catégorie doit faire au moins 2 caractères",
        "string.max": "Le nom de la catégorie ne doit pas dépasser 50 caractères",
    }),
    description: joi_1.default.string().min(10).max(500).messages({
        "string.min": "La description doit faire au moins 10 caractères",
        "string.max": "La description ne doit pas dépasser 500 caractères",
    }),
    icon: joi_1.default.string(),
})
    .min(1)
    .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
});
const validateCategory = (req, res, next) => {
    try {
        const schema = req.method === "POST" ? exports.createCategorySchema : exports.updateCategorySchema;
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path[0],
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation de catégorie:", { errors });
            return res.status(400).json({ errors });
        }
        return next();
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la validation de catégorie:", error);
        return res.status(500).json({
            message: "Erreur lors de la validation des données",
        });
    }
};
exports.validateCategory = validateCategory;
//# sourceMappingURL=categoryValidation.js.map