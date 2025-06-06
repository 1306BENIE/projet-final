import Joi from "joi";

export const notificationValidation = {
  getUserNotifications: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Le numéro de page doit être un nombre",
      "number.integer": "Le numéro de page doit être un entier",
      "number.min": "Le numéro de page doit être supérieur à 0",
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      "number.base": "La limite doit être un nombre",
      "number.integer": "La limite doit être un entier",
      "number.min": "La limite doit être supérieure à 0",
      "number.max": "La limite ne peut pas dépasser 100",
    }),
  }),

  markAsRead: Joi.object({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "L'ID de la notification est requis",
        "any.required": "L'ID de la notification est requis",
        "string.pattern.base": "L'ID de la notification n'est pas valide",
      }),
  }),

  deleteNotification: Joi.object({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "L'ID de la notification est requis",
        "any.required": "L'ID de la notification est requis",
        "string.pattern.base": "L'ID de la notification n'est pas valide",
      }),
  }),
};
