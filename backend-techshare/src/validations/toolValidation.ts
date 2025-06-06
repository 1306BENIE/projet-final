import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const categories = [
  "laptop",
  "desktop",
  "monitor",
  "printer",
  "network",
  "other",
];

export const createToolSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Le nom doit contenir au moins 3 caractères",
    "string.max": "Le nom ne doit pas dépasser 100 caractères",
    "any.required": "Le nom est requis",
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
  price: Joi.number().min(0).max(10000).required().messages({
    "number.min": "Le prix doit être supérieur ou égal à 0",
    "number.max": "Le prix ne doit pas dépasser 10000",
    "any.required": "Le prix est requis",
  }),
  location: Joi.string().min(5).max(200).required().messages({
    "string.min": "La localisation doit contenir au moins 5 caractères",
    "string.max": "La localisation ne doit pas dépasser 200 caractères",
    "any.required": "La localisation est requise",
  }),
  availability: Joi.boolean().default(true).messages({
    "boolean.base": "La disponibilité doit être un booléen",
  }),
});

export const updateToolSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.min": "Le nom doit contenir au moins 3 caractères",
    "string.max": "Le nom ne doit pas dépasser 100 caractères",
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
  price: Joi.number().min(0).max(10000).messages({
    "number.min": "Le prix doit être supérieur ou égal à 0",
    "number.max": "Le prix ne doit pas dépasser 10000",
  }),
  location: Joi.string().min(5).max(200).messages({
    "string.min": "La localisation doit contenir au moins 5 caractères",
    "string.max": "La localisation ne doit pas dépasser 200 caractères",
  }),
  availability: Joi.boolean().messages({
    "boolean.base": "La disponibilité doit être un booléen",
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
