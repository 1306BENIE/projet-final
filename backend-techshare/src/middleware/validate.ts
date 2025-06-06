import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { logger } from "../utils/logger";

export const validateMiddleware = (
  schema: Joi.ObjectSchema,
  type: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req[type], {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        logger.warn("Erreur de validation:", {
          type,
          errors,
          data: req[type],
        });

        return res.status(400).json({
          error: "ValidationError",
          message: "Erreur de validation des données",
          details: errors,
        });
      }

      return next();
    } catch (error) {
      logger.error("Erreur lors de la validation:", {
        error,
        type,
        data: req[type],
      });

      return res.status(500).json({
        error: "ValidationError",
        message: "Erreur lors de la validation des données",
      });
    }
  };
};
