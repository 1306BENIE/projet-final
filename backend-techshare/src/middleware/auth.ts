import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import Joi from "joi";
import { User } from "../models/User";
import { ValidationError, AuthenticationError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ValidationError("Authentification requise");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const userId = decoded.userId || decoded._id;

    const user = await User.findById(userId).select("role");
    if (!user) {
      throw new ValidationError("Utilisateur non trouvé");
    }

    req.user = {
      userId,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ValidationError("Token invalide");
    }
    next(error);
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.role || req.user.role !== "admin") {
      throw new AuthenticationError("Accès administrateur requis", 403);
    }
    next();
  } catch (error) {
    logger.error("Erreur de vérification des droits administrateur:", error);
    if (error instanceof AuthenticationError) {
      res.status(error.code).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
};

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "L'adresse email n'est pas valide",
      "string.empty": "L'adresse email est requise",
      "any.required": "L'adresse email est requise",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        "string.empty": "Le mot de passe est requis",
        "any.required": "Le mot de passe est requis",
      }),
    firstName: Joi.string().required().messages({
      "string.empty": "Le prénom est requis",
      "any.required": "Le prénom est requis",
    }),
    lastName: Joi.string().required().messages({
      "string.empty": "Le nom est requis",
      "any.required": "Le nom est requis",
    }),
    phone: Joi.string().required().messages({
      "string.empty": "Le numéro de téléphone est requis",
      "any.required": "Le numéro de téléphone est requis",
    }),
    address: Joi.object({
      street: Joi.string().required().messages({
        "string.empty": "La rue est requise",
        "any.required": "La rue est requise",
      }),
      city: Joi.string().required().messages({
        "string.empty": "La ville est requise",
        "any.required": "La ville est requise",
      }),
      postalCode: Joi.string().required().messages({
        "string.empty": "Le code postal est requis",
        "any.required": "Le code postal est requis",
      }),
      country: Joi.string().required().messages({
        "string.empty": "Le pays est requis",
        "any.required": "Le pays est requis",
      }),
    }).required(),
    role: Joi.string().valid("user", "admin").default("user").messages({
      "any.only": "Le rôle doit être 'user' ou 'admin'",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "L'adresse email n'est pas valide",
      "string.empty": "L'adresse email est requise",
      "any.required": "L'adresse email est requise",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Le mot de passe est requis",
      "any.required": "Le mot de passe est requis",
    }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().messages({
      "string.empty": "Le prénom ne peut pas être vide",
    }),
    lastName: Joi.string().messages({
      "string.empty": "Le nom ne peut pas être vide",
    }),
    phone: Joi.string().messages({
      "string.empty": "Le numéro de téléphone ne peut pas être vide",
    }),
    address: Joi.object({
      street: Joi.string().messages({
        "string.empty": "La rue ne peut pas être vide",
      }),
      city: Joi.string().messages({
        "string.empty": "La ville ne peut pas être vide",
      }),
      postalCode: Joi.string().messages({
        "string.empty": "Le code postal ne peut pas être vide",
      }),
      country: Joi.string().messages({
        "string.empty": "Le pays ne peut pas être vide",
      }),
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Le mot de passe actuel est requis",
      "any.required": "Le mot de passe actuel est requis",
    }),
    newPassword: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        "string.empty": "Le nouveau mot de passe est requis",
        "any.required": "Le nouveau mot de passe est requis",
      }),
  }),
};
