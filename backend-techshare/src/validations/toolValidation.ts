import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const categories = ["informatique", "bureautique", "multimedia", "autre"];
const etats = ["neuf", "bon_etat", "usage"];

export const createToolSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Le nom doit contenir au moins 3 caractères",
    "string.max": "Le nom ne doit pas dépasser 100 caractères",
    "any.required": "Le nom est requis",
  }),
  brand: Joi.string().min(2).max(50).required().messages({
    "string.min": "La marque doit contenir au moins 2 caractères",
    "string.max": "La marque ne doit pas dépasser 50 caractères",
    "any.required": "La marque est requise",
  }),
  modelName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Le modèle doit contenir au moins 2 caractères",
    "string.max": "Le modèle ne doit pas dépasser 50 caractères",
    "any.required": "Le modèle est requis",
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne doit pas dépasser 1000 caractères",
    "any.required": "La description est requise",
  }),
  category: Joi.string()
    .valid(...categories)
    .required()
    .messages({
      "any.only":
        "La catégorie doit être l'une des suivantes : " + categories.join(", "),
      "any.required": "La catégorie est requise",
    }),
  etat: Joi.string()
    .valid(...etats)
    .required()
    .messages({
      "any.only": "L'état doit être l'un des suivants : " + etats.join(", "),
      "any.required": "L'état est requis",
    }),
  dailyPrice: Joi.number().min(0).required().messages({
    "number.min": "Le prix journalier doit être supérieur ou égal à 0",
    "any.required": "Le prix journalier est requis",
  }),
  caution: Joi.number().min(0).required().messages({
    "number.min": "La caution doit être supérieure ou égale à 0",
    "any.required": "La caution est requise",
  }),
  isInsured: Joi.boolean().default(false).messages({
    "boolean.base": "L'assurance doit être un booléen",
  }),
  location: Joi.object({
    type: Joi.string().valid("Point").required().messages({
      "any.only": 'Le type de localisation doit être "Point"',
      "any.required": "Le type de localisation est requis",
    }),
    coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
      "array.length":
        "Les coordonnées doivent contenir exactement 2 valeurs (longitude, latitude)",
      "any.required": "Les coordonnées sont requises",
    }),
  }).required(),
  address: Joi.string().min(5).max(200).required().messages({
    "string.min": "L'adresse doit contenir au moins 5 caractères",
    "string.max": "L'adresse ne doit pas dépasser 200 caractères",
    "any.required": "L'adresse est requise",
  }),
  images: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "Au moins une image est requise",
    "any.required": "Les images sont requises",
  }),
});

export const updateToolSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.min": "Le nom doit contenir au moins 3 caractères",
    "string.max": "Le nom ne doit pas dépasser 100 caractères",
  }),
  brand: Joi.string().min(2).max(50).messages({
    "string.min": "La marque doit contenir au moins 2 caractères",
    "string.max": "La marque ne doit pas dépasser 50 caractères",
  }),
  modelName: Joi.string().min(2).max(50).messages({
    "string.min": "Le modèle doit contenir au moins 2 caractères",
    "string.max": "Le modèle ne doit pas dépasser 50 caractères",
  }),
  description: Joi.string().min(10).max(1000).messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne doit pas dépasser 1000 caractères",
  }),
  category: Joi.string()
    .valid(...categories)
    .messages({
      "any.only":
        "La catégorie doit être l'une des suivantes : " + categories.join(", "),
    }),
  etat: Joi.string()
    .valid(...etats)
    .messages({
      "any.only": "L'état doit être l'un des suivants : " + etats.join(", "),
    }),
  dailyPrice: Joi.number().min(0).messages({
    "number.min": "Le prix journalier doit être supérieur ou égal à 0",
  }),
  caution: Joi.number().min(0).messages({
    "number.min": "La caution doit être supérieure ou égale à 0",
  }),
  isInsured: Joi.boolean().messages({
    "boolean.base": "L'assurance doit être un booléen",
  }),
  location: Joi.object({
    type: Joi.string().valid("Point").required().messages({
      "any.only": 'Le type de localisation doit être "Point"',
      "any.required": "Le type de localisation est requis",
    }),
    coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
      "array.length":
        "Les coordonnées doivent contenir exactement 2 valeurs (longitude, latitude)",
      "any.required": "Les coordonnées sont requises",
    }),
  }),
  address: Joi.string().min(5).max(200).messages({
    "string.min": "L'adresse doit contenir au moins 5 caractères",
    "string.max": "L'adresse ne doit pas dépasser 200 caractères",
  }),
  images: Joi.array().items(Joi.string()).min(1).messages({
    "array.min": "Au moins une image est requise",
  }),
});

export const validateTool = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = req.method === "POST" ? createToolSchema : updateToolSchema;
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      logger.warn("Erreur de validation d'outil:", { errors });
      return res.status(400).json({ errors });
    }

    return next();
  } catch (error) {
    logger.error("Erreur lors de la validation d'outil:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};
