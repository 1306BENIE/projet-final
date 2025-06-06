"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchemas = exports.adminMiddleware = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const joi_1 = __importDefault(require("joi"));
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const auth = async (req, _res, next) => {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            throw new errors_1.ValidationError("Authentification requise");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User_1.User.findById(decoded.userId).select("role");
        if (!user) {
            throw new errors_1.ValidationError("Utilisateur non trouvé");
        }
        req.user = {
            userId: decoded.userId,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errors_1.ValidationError("Token invalide");
        }
        next(error);
    }
};
exports.auth = auth;
const adminMiddleware = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== "admin") {
            throw new errors_1.AuthenticationError("Accès administrateur requis", 403);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error("Erreur de vérification des droits administrateur:", error);
        if (error instanceof errors_1.AuthenticationError) {
            res.status(error.code).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }
};
exports.adminMiddleware = adminMiddleware;
exports.authSchemas = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "L'adresse email n'est pas valide",
            "string.empty": "L'adresse email est requise",
            "any.required": "L'adresse email est requise",
        }),
        password: joi_1.default.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
            "string.pattern.base": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
            "string.empty": "Le mot de passe est requis",
            "any.required": "Le mot de passe est requis",
        }),
        firstName: joi_1.default.string().required().messages({
            "string.empty": "Le prénom est requis",
            "any.required": "Le prénom est requis",
        }),
        lastName: joi_1.default.string().required().messages({
            "string.empty": "Le nom est requis",
            "any.required": "Le nom est requis",
        }),
        phone: joi_1.default.string().required().messages({
            "string.empty": "Le numéro de téléphone est requis",
            "any.required": "Le numéro de téléphone est requis",
        }),
        address: joi_1.default.object({
            street: joi_1.default.string().required().messages({
                "string.empty": "La rue est requise",
                "any.required": "La rue est requise",
            }),
            city: joi_1.default.string().required().messages({
                "string.empty": "La ville est requise",
                "any.required": "La ville est requise",
            }),
            postalCode: joi_1.default.string().required().messages({
                "string.empty": "Le code postal est requis",
                "any.required": "Le code postal est requis",
            }),
            country: joi_1.default.string().required().messages({
                "string.empty": "Le pays est requis",
                "any.required": "Le pays est requis",
            }),
        }).required(),
        role: joi_1.default.string().valid("user", "admin").default("user").messages({
            "any.only": "Le rôle doit être 'user' ou 'admin'",
        }),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "L'adresse email n'est pas valide",
            "string.empty": "L'adresse email est requise",
            "any.required": "L'adresse email est requise",
        }),
        password: joi_1.default.string().required().messages({
            "string.empty": "Le mot de passe est requis",
            "any.required": "Le mot de passe est requis",
        }),
    }),
    updateProfile: joi_1.default.object({
        firstName: joi_1.default.string().messages({
            "string.empty": "Le prénom ne peut pas être vide",
        }),
        lastName: joi_1.default.string().messages({
            "string.empty": "Le nom ne peut pas être vide",
        }),
        phone: joi_1.default.string().messages({
            "string.empty": "Le numéro de téléphone ne peut pas être vide",
        }),
        address: joi_1.default.object({
            street: joi_1.default.string().messages({
                "string.empty": "La rue ne peut pas être vide",
            }),
            city: joi_1.default.string().messages({
                "string.empty": "La ville ne peut pas être vide",
            }),
            postalCode: joi_1.default.string().messages({
                "string.empty": "Le code postal ne peut pas être vide",
            }),
            country: joi_1.default.string().messages({
                "string.empty": "Le pays ne peut pas être vide",
            }),
        }),
    }),
    changePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required().messages({
            "string.empty": "Le mot de passe actuel est requis",
            "any.required": "Le mot de passe actuel est requis",
        }),
        newPassword: joi_1.default.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
            "string.pattern.base": "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
            "string.empty": "Le nouveau mot de passe est requis",
            "any.required": "Le nouveau mot de passe est requis",
        }),
    }),
};
//# sourceMappingURL=auth.js.map