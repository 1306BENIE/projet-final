import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const createCategorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    "string.empty": "Le nom de la catégorie est requis",
    "string.min": "Le nom de la catégorie doit faire au moins 2 caractères",
    "string.max": "Le nom de la catégorie ne doit pas dépasser 50 caractères",
    "any.required": "Le nom de la catégorie est requis",
  }),
  description: Joi.string().required().min(10).max(500).messages({
    "string.empty": "La description est requise",
    "string.min": "La description doit faire au moins 10 caractères",
    "string.max": "La description ne doit pas dépasser 500 caractères",
    "any.required": "La description est requise",
  }),
  icon: Joi.string().required().messages({
    "string.empty": "L'icône est requise",
    "any.required": "L'icône est requise",
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    "string.min": "Le nom de la catégorie doit faire au moins 2 caractères",
    "string.max": "Le nom de la catégorie ne doit pas dépasser 50 caractères",
  }),
  description: Joi.string().min(10).max(500).messages({
    "string.min": "La description doit faire au moins 10 caractères",
    "string.max": "La description ne doit pas dépasser 500 caractères",
  }),
  icon: Joi.string(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema =
      req.method === "POST" ? createCategorySchema : updateCategorySchema;
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      logger.warn("Erreur de validation de catégorie:", { errors });
      return res.status(400).json({ errors });
    }

    return next();
  } catch (error) {
    logger.error("Erreur lors de la validation de catégorie:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};
