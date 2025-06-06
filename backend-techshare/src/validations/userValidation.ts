import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

// Ajouter ces constantes pour les options de tri
const SORT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "createdAt",
  "role",
] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Veuillez fournir une adresse email valide",
      "any.required": "L'email est requis",
    }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    "any.required": "Le mot de passe est requis",
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Le prénom doit contenir au moins 2 caractères",
    "string.max": "Le prénom ne doit pas dépasser 50 caractères",
    "any.required": "Le prénom est requis",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne doit pas dépasser 50 caractères",
    "any.required": "Le nom est requis",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .required()
    .messages({
      "string.pattern.base": "Veuillez fournir un numéro de téléphone valide",
      "any.required": "Le numéro de téléphone est requis",
    }),
  address: Joi.object({
    street: Joi.string().min(3).max(100).required().messages({
      "string.min": "La rue doit contenir au moins 3 caractères",
      "string.max": "La rue ne doit pas dépasser 100 caractères",
      "any.required": "La rue est requise",
    }),
    city: Joi.string().min(2).max(50).required().messages({
      "string.min": "La ville doit contenir au moins 2 caractères",
      "string.max": "La ville ne doit pas dépasser 50 caractères",
      "any.required": "La ville est requise",
    }),
    postalCode: Joi.string()
      .pattern(/^[0-9]{5}$/)
      .required()
      .messages({
        "string.pattern.base": "Le code postal doit contenir 5 chiffres",
        "any.required": "Le code postal est requis",
      }),
    country: Joi.string().min(2).max(50).required().messages({
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

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Veuillez fournir une adresse email valide",
      "any.required": "L'email est requis",
    }),
  password: Joi.string().required().messages({
    "any.required": "Le mot de passe est requis",
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).messages({
    "string.min": "Le prénom doit contenir au moins 2 caractères",
    "string.max": "Le prénom ne doit pas dépasser 50 caractères",
  }),
  lastName: Joi.string().min(2).max(50).messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne doit pas dépasser 50 caractères",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .messages({
      "string.pattern.base": "Veuillez fournir un numéro de téléphone valide",
    }),
  address: Joi.object({
    street: Joi.string().min(3).max(100).messages({
      "string.min": "La rue doit contenir au moins 3 caractères",
      "string.max": "La rue ne doit pas dépasser 100 caractères",
    }),
    city: Joi.string().min(2).max(50).messages({
      "string.min": "La ville doit contenir au moins 2 caractères",
      "string.max": "La ville ne doit pas dépasser 50 caractères",
    }),
    postalCode: Joi.string()
      .pattern(/^[0-9]{5}$/)
      .messages({
        "string.pattern.base": "Le code postal doit contenir 5 chiffres",
      }),
    country: Joi.string().min(2).max(50).messages({
      "string.min": "Le pays doit contenir au moins 2 caractères",
      "string.max": "Le pays ne doit pas dépasser 50 caractères",
    }),
  }).messages({
    "object.base": "L'adresse doit être un objet",
  }),
});

// Mettre à jour le schéma de pagination avec les nouveaux paramètres
export const userListSchema = Joi.object({
  // Paramètres de pagination
  page: Joi.number().min(1).default(1).messages({
    "number.base": "Le numéro de page doit être un nombre",
    "number.min": "Le numéro de page doit être supérieur à 0",
  }),
  limit: Joi.number().min(1).max(100).default(10).messages({
    "number.base": "La limite doit être un nombre",
    "number.min": "La limite doit être supérieure à 0",
    "number.max": "La limite ne peut pas dépasser 100",
  }),
  // Paramètres de tri
  sortBy: Joi.string()
    .valid(...SORT_FIELDS)
    .default("createdAt")
    .messages({
      "any.only": `Le tri doit être l'un des champs suivants : ${SORT_FIELDS.join(
        ", "
      )}`,
    }),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .default("desc")
    .messages({
      "any.only": 'L\'ordre de tri doit être "asc" ou "desc"',
    }),
  // Paramètres de recherche
  search: Joi.string().min(2).max(50).messages({
    "string.min": "La recherche doit contenir au moins 2 caractères",
    "string.max": "La recherche ne doit pas dépasser 50 caractères",
  }),
  // Paramètres de filtrage
  role: Joi.string().valid("user", "admin").messages({
    "any.only": 'Le rôle doit être "user" ou "admin"',
  }),
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string().required().messages({
    "any.required": "Le mot de passe est requis pour la suppression du compte",
  }),
  confirmation: Joi.string().valid("DELETE").required().messages({
    "any.only": "Veuillez écrire DELETE pour confirmer la suppression",
    "any.required": "La confirmation est requise",
  }),
});

// Schéma pour la demande de réinitialisation
export const requestPasswordResetSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Veuillez fournir une adresse email valide",
      "any.required": "L'email est requis",
    }),
});

// Schéma pour la réinitialisation du mot de passe
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Le token est requis",
  }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    "any.required": "Le mot de passe est requis",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Les mots de passe ne correspondent pas",
    "any.required": "La confirmation du mot de passe est requise",
  }),
});

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let schema;
    const path = req.path.toLowerCase();

    if (path.includes("register")) {
      schema = registerSchema;
    } else if (path.includes("login")) {
      schema = loginSchema;
    } else if (path.includes("profile")) {
      schema = updateProfileSchema;
    } else if (path.includes("list")) {
      schema = userListSchema;
    } else if (path.includes("delete")) {
      schema = deleteAccountSchema;
    } else if (path.includes("reset-password")) {
      schema =
        req.method === "POST"
          ? requestPasswordResetSchema
          : resetPasswordSchema;
    } else {
      return next();
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      logger.warn("Erreur de validation utilisateur:", { errors });
      return res.status(400).json({ errors });
    }

    return next();
  } catch (error) {
    logger.error("Erreur lors de la validation utilisateur:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};
