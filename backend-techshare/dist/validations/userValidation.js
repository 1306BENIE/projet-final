"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.deleteAccountSchema = exports.userListSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
// Ajouter ces constantes pour les options de tri
const SORT_FIELDS = [
    "firstName",
    "lastName",
    "email",
    "createdAt",
    "role",
];
const SORT_ORDERS = ["asc", "desc"];
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        "string.email": "Veuillez fournir une adresse email valide",
        "any.required": "L'email est requis",
    }),
    password: joi_1.default.string().pattern(passwordRegex).required().messages({
        "string.pattern.base": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        "any.required": "Le mot de passe est requis",
    }),
    firstName: joi_1.default.string().min(2).max(50).required().messages({
        "string.min": "Le prénom doit contenir au moins 2 caractères",
        "string.max": "Le prénom ne doit pas dépasser 50 caractères",
        "any.required": "Le prénom est requis",
    }),
    lastName: joi_1.default.string().min(2).max(50).required().messages({
        "string.min": "Le nom doit contenir au moins 2 caractères",
        "string.max": "Le nom ne doit pas dépasser 50 caractères",
        "any.required": "Le nom est requis",
    }),
    phone: joi_1.default.string()
        .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
        .required()
        .messages({
        "string.pattern.base": "Veuillez fournir un numéro de téléphone valide",
        "any.required": "Le numéro de téléphone est requis",
    }),
    address: joi_1.default.object({
        street: joi_1.default.string().min(3).max(100).required().messages({
            "string.min": "La rue doit contenir au moins 3 caractères",
            "string.max": "La rue ne doit pas dépasser 100 caractères",
            "any.required": "La rue est requise",
        }),
        city: joi_1.default.string().min(2).max(50).required().messages({
            "string.min": "La ville doit contenir au moins 2 caractères",
            "string.max": "La ville ne doit pas dépasser 50 caractères",
            "any.required": "La ville est requise",
        }),
        postalCode: joi_1.default.string()
            .pattern(/^[0-9]{5}$/)
            .required()
            .messages({
            "string.pattern.base": "Le code postal doit contenir 5 chiffres",
            "any.required": "Le code postal est requis",
        }),
        country: joi_1.default.string().min(2).max(50).required().messages({
            "string.min": "Le pays doit contenir au moins 2 caractères",
            "string.max": "Le pays ne doit pas dépasser 50 caractères",
            "any.required": "Le pays est requis",
        }),
    })
        .required()
        .messages({
        "object.base": "L'adresse doit être un objet",
        "any.required": "L'adresse est requise",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        "string.email": "Veuillez fournir une adresse email valide",
        "any.required": "L'email est requis",
    }),
    password: joi_1.default.string().required().messages({
        "any.required": "Le mot de passe est requis",
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(50).messages({
        "string.min": "Le prénom doit contenir au moins 2 caractères",
        "string.max": "Le prénom ne doit pas dépasser 50 caractères",
    }),
    lastName: joi_1.default.string().min(2).max(50).messages({
        "string.min": "Le nom doit contenir au moins 2 caractères",
        "string.max": "Le nom ne doit pas dépasser 50 caractères",
    }),
    phone: joi_1.default.string()
        .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
        .messages({
        "string.pattern.base": "Veuillez fournir un numéro de téléphone valide",
    }),
    address: joi_1.default.object({
        street: joi_1.default.string().min(3).max(100).messages({
            "string.min": "La rue doit contenir au moins 3 caractères",
            "string.max": "La rue ne doit pas dépasser 100 caractères",
        }),
        city: joi_1.default.string().min(2).max(50).messages({
            "string.min": "La ville doit contenir au moins 2 caractères",
            "string.max": "La ville ne doit pas dépasser 50 caractères",
        }),
        postalCode: joi_1.default.string()
            .pattern(/^[0-9]{5}$/)
            .messages({
            "string.pattern.base": "Le code postal doit contenir 5 chiffres",
        }),
        country: joi_1.default.string().min(2).max(50).messages({
            "string.min": "Le pays doit contenir au moins 2 caractères",
            "string.max": "Le pays ne doit pas dépasser 50 caractères",
        }),
    }).messages({
        "object.base": "L'adresse doit être un objet",
    }),
});
// Mettre à jour le schéma de pagination avec les nouveaux paramètres
exports.userListSchema = joi_1.default.object({
    // Paramètres de pagination
    page: joi_1.default.number().min(1).default(1).messages({
        "number.base": "Le numéro de page doit être un nombre",
        "number.min": "Le numéro de page doit être supérieur à 0",
    }),
    limit: joi_1.default.number().min(1).max(100).default(10).messages({
        "number.base": "La limite doit être un nombre",
        "number.min": "La limite doit être supérieure à 0",
        "number.max": "La limite ne peut pas dépasser 100",
    }),
    // Paramètres de tri
    sortBy: joi_1.default.string()
        .valid(...SORT_FIELDS)
        .default("createdAt")
        .messages({
        "any.only": `Le tri doit être l'un des champs suivants : ${SORT_FIELDS.join(", ")}`,
    }),
    sortOrder: joi_1.default.string()
        .valid(...SORT_ORDERS)
        .default("desc")
        .messages({
        "any.only": 'L\'ordre de tri doit être "asc" ou "desc"',
    }),
    // Paramètres de recherche
    search: joi_1.default.string().min(2).max(50).messages({
        "string.min": "La recherche doit contenir au moins 2 caractères",
        "string.max": "La recherche ne doit pas dépasser 50 caractères",
    }),
    // Paramètres de filtrage
    role: joi_1.default.string().valid("user", "admin").messages({
        "any.only": 'Le rôle doit être "user" ou "admin"',
    }),
});
exports.deleteAccountSchema = joi_1.default.object({
    password: joi_1.default.string().required().messages({
        "any.required": "Le mot de passe est requis pour la suppression du compte",
    }),
    confirmation: joi_1.default.string().valid("DELETE").required().messages({
        "any.only": "Veuillez écrire DELETE pour confirmer la suppression",
        "any.required": "La confirmation est requise",
    }),
});
// Schéma pour la demande de réinitialisation
exports.requestPasswordResetSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
        "string.email": "Veuillez fournir une adresse email valide",
        "any.required": "L'email est requis",
    }),
});
// Schéma pour la réinitialisation du mot de passe
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        "any.required": "Le token est requis",
    }),
    password: joi_1.default.string().pattern(passwordRegex).required().messages({
        "string.pattern.base": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        "any.required": "Le mot de passe est requis",
    }),
    confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required().messages({
        "any.only": "Les mots de passe ne correspondent pas",
        "any.required": "La confirmation du mot de passe est requise",
    }),
});
const validateUser = (req, res, next) => {
    try {
        let schema;
        const path = req.path.toLowerCase();
        if (path.includes("register")) {
            schema = exports.registerSchema;
        }
        else if (path.includes("login")) {
            schema = exports.loginSchema;
        }
        else if (path.includes("profile")) {
            schema = exports.updateProfileSchema;
        }
        else if (path.includes("list")) {
            schema = exports.userListSchema;
        }
        else if (path.includes("delete")) {
            schema = exports.deleteAccountSchema;
        }
        else if (path.includes("reset-password")) {
            schema =
                req.method === "POST"
                    ? exports.requestPasswordResetSchema
                    : exports.resetPasswordSchema;
        }
        else {
            return next();
        }
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path[0],
                message: detail.message,
            }));
            logger_1.logger.warn("Erreur de validation utilisateur:", { errors });
            return res.status(400).json({ errors });
        }
        return next();
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la validation utilisateur:", error);
        return res.status(500).json({
            message: "Erreur lors de la validation des données",
        });
    }
};
exports.validateUser = validateUser;
//# sourceMappingURL=userValidation.js.map