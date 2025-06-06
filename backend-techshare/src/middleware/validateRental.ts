import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";
import { Types } from "mongoose";

// Constantes de validation
const MIN_RENTAL_DAYS = 1;
const MAX_RENTAL_DAYS = 30;

export const validateRental = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { toolId, startDate, endDate } = req.body;

    // Validation de l'ID de l'outil
    if (!toolId || !Types.ObjectId.isValid(toolId)) {
      throw new ValidationError("ID d'outil invalide");
    }

    // Validation des dates
    if (!startDate || !endDate) {
      throw new ValidationError("Les dates de début et de fin sont requises");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validation de la date de début
    if (start < now) {
      throw new ValidationError("La date de début doit être dans le futur");
    }

    // Validation de la date de fin
    if (end <= start) {
      throw new ValidationError(
        "La date de fin doit être après la date de début"
      );
    }

    // Calcul de la durée en jours
    const durationInDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Validation de la durée
    if (durationInDays < MIN_RENTAL_DAYS) {
      throw new ValidationError(
        `La durée minimale de location est de ${MIN_RENTAL_DAYS} jour(s)`
      );
    }

    if (durationInDays > MAX_RENTAL_DAYS) {
      throw new ValidationError(
        `La durée maximale de location est de ${MAX_RENTAL_DAYS} jours`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
