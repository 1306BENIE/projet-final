import Joi from "joi";

export const createRentalSchema = Joi.object({
  toolId: Joi.string().required(),
  startDate: Joi.date().min("now").required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
  totalPrice: Joi.number().min(0).required(),
});

export const updateRentalStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "accepted", "rejected", "completed")
    .required(),
});

export const addReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});
