"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTool = exports.updateToolSchema = exports.createToolSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
const categories = ["informatique", "bureautique", "multimedia", "autre"];
const etats = ["neuf", "bon_etat", "usage"];
exports.createToolSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(100).required().messages({
        "string.min": "Le nom doit contenir au moins 3 caractères",
        "string.max": "Le nom ne doit pas dépasser 100 caractères",
        "any.required": "Le nom est requis",
    }),
    brand: joi_1.default.string().min(2).max(50).required().messages({
        "string.min": "La marque doit contenir au moins 2 caractères",
        "string.max": "La marque ne doit pas dépasser 50 caractères",
        "any.required": "La marque est requise",
    }),
    modelName: joi_1.default.string().min(2).max(50).required().messages({
        "string.min": "Le modèle doit contenir au moins 2 caractères",
        "string.max": "Le modèle ne doit pas dépasser 50 caractères",
        "any.required": "Le modèle est requis",
    }),
    description: joi_1.default.string().min(10).max(1000).required().messages({
        "string.min": "La description doit contenir au moins 10 caractères",
        "string.max": "La description ne doit pas dépasser 1000 caractères",
        "any.required": "La description est requise",
    }),
    category: joi_1.default.string()
        .valid(...categories)
        .required()
        .messages({
        "any.only": "La catégorie doit être l'une des suivantes : " + categories.join(", "),
        "any.required": "La catégorie est requise",
    }),
    etat: joi_1.default.string()
        .valid(...etats)
        .required()
        .messages({
        "any.only": "L'état doit être l'un des suivants : " + etats.join(", "),
        "any.required": "L'état est requis",
    }),
    dailyPrice: joi_1.default.number().min(0).required().messages({
        "number.min": "Le prix journalier doit être supérieur ou égal à 0",
        "any.required": "Le prix journalier est requis",
    }),
    caution: joi_1.default.number().min(0).required().messages({
        "number.min": "La caution doit être supérieure ou égale à 0",
        "any.required": "La caution est requise",
    }),
    isInsured: joi_1.default.boolean().default(false).messages({
        "boolean.base": "L'assurance doit être un booléen",
    }),
    location: joi_1.default.object({
        type: joi_1.default.string().valid("Point").required().messages({
            "any.only": 'Le type de localisation doit être "Point"',
            "any.required": "Le type de localisation est requis",
        }),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2).required().messages({
            "array.length": "Les coordonnées doivent contenir exactement 2 valeurs (longitude, latitude)",
            "any.required": "Les coordonnées sont requises",
        }),
    }).required(),
    address: joi_1.default.string().min(5).max(200).required().messages({
        "string.min": "L'adresse doit contenir au moins 5 caractères",
        "string.max": "L'adresse ne doit pas dépasser 200 caractères",
        "any.required": "L'adresse est requise",
    }),
    images: joi_1.default.array().items(joi_1.default.string()).min(1).required().messages({
        "array.min": "Au moins une image est requise",
        "any.required": "Les images sont requises",
    }),
});
exports.updateToolSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(100).messages({
        "string.min": "Le nom doit contenir au moins 3 caractères",
        "string.max": "Le nom ne doit pas dépasser 100 caractères",
    }),
    brand: joi_1.default.string().min(2).max(50).messages({
        "string.min": "La marque doit contenir au moins 2 caractères",
        "string.max": "La marque ne doit pas dépasser 50 caractères",
    }),
    modelName: joi_1.default.string().min(2).max(50).messages({
        "string.min": "Le modèle doit contenir au moins 2 caractères",
        "string.max": "Le modèle ne doit pas dépasser 50 caractères",
    }),
    description: joi_1.default.string().min(10).max(1000).messages({
        "string.min": "La description doit contenir au moins 10 caractères",
        "string.max": "La description ne doit pas dépasser 1000 caractères",
    }),
    category: joi_1.default.string()
        .valid(...categories)
        .messages({
        "any.only": "La catégorie doit être l'une des suivantes : " + categories.join(", "),
    }),
    etat: joi_1.default.string()
        .valid(...etats)
        .messages({
        "any.only": "L'état doit être l'un des suivants : " + etats.join(", "),
    }),
    dailyPrice: joi_1.default.number().min(0).messages({
        "number.min": "Le prix journalier doit être supérieur ou égal à 0",
    }),
    caution: joi_1.default.number().min(0).messages({
        "number.min": "La caution doit être supérieure ou égale à 0",
    }),
    isInsured: joi_1.default.boolean().messages({
        "boolean.base": "L'assurance doit être un booléen",
    }),
    location: joi_1.default.object({
        type: joi_1.default.string().valid("Point").required().messages({
            "any.only": 'Le type de localisation doit être "Point"',
            "any.required": "Le type de localisation est requis",
        }),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2).required().messages({
            "array.length": "Les coordonnées doivent contenir exactement 2 valeurs (longitude, latitude)",
            "any.required": "Les coordonnées sont requises",
        }),
    }),
    address: joi_1.default.string().min(5).max(200).messages({
        "string.min": "L'adresse doit contenir au moins 5 caractères",
        "string.max": "L'adresse ne doit pas dépasser 200 caractères",
    }),
    images: joi_1.default.array().items(joi_1.default.string()).min(1).messages({
        "array.min": "Au moins une image est requise",
    }),
});
const validateTool = (req, res, next) => {
    try {
        const schema = req.method === "POST" ? exports.createToolSchema : exports.updateToolSchema;
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path[0],
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation d'outil:", { errors });
            return res.status(400).json({ errors });
        }
        return next();
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la validation d'outil:", error);
        return res.status(500).json({
            message: "Erreur lors de la validation des données",
        });
    }
};
exports.validateTool = validateTool;
//# sourceMappingURL=toolValidation.js.map