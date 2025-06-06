import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ValidationError } from "../utils/errors";

export const reviewSchema = Joi.object({
  toolId: Joi.string().required().messages({
    "string.empty": "L'ID de l'outil est requis",
    "any.required": "L'ID de l'outil est requis",
  }),
  rentalId: Joi.string().required().messages({
    "string.empty": "L'ID de la location est requis",
    "any.required": "L'ID de la location est requis",
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au minimum 1",
    "number.max": "La note doit être au maximum 5",
    "any.required": "La note est requise",
  }),
  comment: Joi.string().min(10).max(500).required().messages({
    "string.empty": "Le commentaire est requis",
    "string.min": "Le commentaire doit faire au moins 10 caractères",
    "string.max": "Le commentaire ne doit pas dépasser 500 caractères",
    "any.required": "Le commentaire est requis",
  }),
});

export const reviewParamsSchema = Joi.object({
  reviewId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "L'ID de l'avis n'est pas valide",
    }),
  toolId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "L'ID de l'outil n'est pas valide",
    }),
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "L'ID de l'utilisateur n'est pas valide",
    }),
});

interface ValidationErrorDetail {
  field: string;
  message: string;
}

export const validateReview = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { error } = reviewSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors: ValidationErrorDetail[] = error.details.map((detail) => ({
        field: String(detail.path[0]),
        message: detail.message,
      }));

      logger.warn("Erreur de validation d'avis:", { errors });
      throw new ValidationError("Données d'avis invalides", errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateReviewParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { error } = reviewParamsSchema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors: ValidationErrorDetail[] = error.details.map((detail) => ({
        field: String(detail.path[0]),
        message: detail.message,
      }));

      logger.warn("Erreur de validation des paramètres d'avis:", { errors });
      throw new ValidationError("Paramètres d'avis invalides", errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};
