import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().required().min(1).messages({
    "number.base": "Le montant doit être un nombre",
    "number.min": "Le montant doit être supérieur à 0",
    "any.required": "Le montant est requis",
  }),
  currency: Joi.string().default("eur").valid("eur", "usd").messages({
    "string.base": "La devise doit être une chaîne de caractères",
    "any.only": "La devise doit être 'eur' ou 'usd'",
  }),
  rentalId: Joi.string().required().messages({
    "string.empty": "L'ID de la location est requis",
    "any.required": "L'ID de la location est requis",
  }),
  paymentMethodId: Joi.string().required().messages({
    "string.empty": "L'ID de la méthode de paiement est requis",
    "any.required": "L'ID de la méthode de paiement est requis",
  }),
});

export const refundPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required().messages({
    "string.empty": "L'ID du paiement est requis",
    "any.required": "L'ID du paiement est requis",
  }),
  amount: Joi.number().min(0).messages({
    "number.base": "Le montant doit être un nombre",
    "number.min": "Le montant ne peut pas être négatif",
  }),
  reason: Joi.string().messages({
    "string.base": "La raison doit être une chaîne de caractères",
  }),
});

export const webhookSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  data: Joi.object().required(),
  created: Joi.number().required(),
});

export const getPaymentIntentSchema = Joi.object({
  paymentIntentId: Joi.string().required().messages({
    "string.empty": "L'ID du paiement est requis",
    "any.required": "L'ID du paiement est requis",
  }),
});

export const getPaymentHistorySchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    "number.base": "La page doit être un nombre",
    "number.min": "La page doit être supérieure à 0",
  }),
  limit: Joi.number().min(1).max(100).default(20).messages({
    "number.base": "La limite doit être un nombre",
    "number.min": "La limite doit être supérieure à 0",
    "number.max": "La limite ne peut pas dépasser 100",
  }),
});

export const validatePayment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = req.path.includes("refund")
      ? refundPaymentSchema
      : createPaymentIntentSchema;
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      logger.warn("Erreur de validation de paiement:", { errors });
      return res.status(400).json({ errors });
    }

    return next();
  } catch (error) {
    logger.error("Erreur lors de la validation de paiement:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};
