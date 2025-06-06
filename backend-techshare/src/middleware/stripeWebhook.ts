import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { logger } from "../utils/logger";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-05-28.basil",
});

export const stripeWebhookMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ message: "Signature Stripe manquante" });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );
    req.body = event;
    return next();
  } catch (error) {
    logger.error("Erreur de validation du webhook Stripe:", error);
    return res.status(400).json({ message: "Signature Stripe invalide" });
  }
};
