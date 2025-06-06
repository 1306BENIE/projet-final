import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";
import { Types } from "mongoose";

// Constantes de validation
const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;

export const validateReview = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { toolId, rating, comment } = req.body;

    // Validation de l'ID de l'outil (pour la création uniquement)
    if (req.method === "POST" && (!toolId || !Types.ObjectId.isValid(toolId))) {
      throw new ValidationError("ID d'outil invalide");
    }

    // Validation de la note
    if (!rating || typeof rating !== "number") {
      throw new ValidationError("La note est requise et doit être un nombre");
    }

    if (rating < MIN_RATING || rating > MAX_RATING) {
      throw new ValidationError(
        `La note doit être comprise entre ${MIN_RATING} et ${MAX_RATING}`
      );
    }

    // Validation du commentaire (optionnel)
    if (comment) {
      if (typeof comment !== "string") {
        throw new ValidationError(
          "Le commentaire doit être une chaîne de caractères"
        );
      }

      if (comment.length < MIN_COMMENT_LENGTH) {
        throw new ValidationError(
          `Le commentaire doit contenir au moins ${MIN_COMMENT_LENGTH} caractères`
        );
      }

      if (comment.length > MAX_COMMENT_LENGTH) {
        throw new ValidationError(
          `Le commentaire ne doit pas dépasser ${MAX_COMMENT_LENGTH} caractères`
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
