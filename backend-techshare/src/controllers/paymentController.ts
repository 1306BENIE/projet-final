import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { Booking, Tool } from "../models";
import { logger } from "../utils/logger";
import { IRental } from "../interfaces/rental.interface";
import { ITool } from "../interfaces/tool.interface";
import { Types } from "mongoose";
import {
  ValidationError,
  AuthenticationError,
  DatabaseError,
} from "../utils/errors";
import { IBooking } from "../interfaces/booking.interface";

// Interface pour les données de paiement
interface PaymentData {
  rentalId: string;
  paymentIntentId?: string;
  amount?: number;
  reason?: "requested_by_customer" | "duplicate" | "fraudulent";
}

// Interface pour les réponses d'API
interface PaymentResponse {
  message: string;
  clientSecret?: string;
  paymentIntent?: Stripe.PaymentIntent;
  refund?: Stripe.Refund;
  bookings?: IBooking[];
}

// Vérification de la clé secrète Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-05-28.basil" });

export const paymentController = {
  // Create payment intent
  async createPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info("[Paiement] Body reçu:", JSON.stringify(req.body));
      logger.info("[Paiement] Devise reçue:", req.body.currency);
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }
      const { rentalId, amount, currency, paymentMethodId } = req.body;
      logger.info("[Paiement] Champs reçus:", {
        rentalId,
        amount,
        currency,
        paymentMethodId,
      });

      // Log de debug pour l'ID reçu
      logger.info("[Paiement] rentalId reçu:", rentalId);

      if (!rentalId) {
        throw new ValidationError("L'ID de la réservation est requis");
      }

      const booking = await Booking.findById(rentalId).populate("tool");
      logger.info("[Paiement] Booking trouvé:", booking);
      if (!booking) {
        throw new DatabaseError("Réservation non trouvée");
      }

      // Check if user is the renter
      if (booking.renter.toString() !== req.user.userId) {
        throw new AuthenticationError("Accès refusé");
      }

      // Check if payment is already completed
      if (booking.paymentStatus === "paid") {
        throw new ValidationError("Le paiement a déjà été effectué");
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents and ensure integer
        currency: "eur",
        metadata: {
          bookingId: booking._id.toString(),
          userId: req.user.userId,
        },
      });

      // Update booking with payment intent ID
      booking.paymentIntentId = paymentIntent.id;
      await booking.save();

      const response = {
        message: "Intention de paiement créée avec succès",
        clientSecret: paymentIntent.client_secret || undefined,
      };
      res.status(201).json(response);
    } catch (error) {
      logger.error("[Paiement] Erreur dans createPaymentIntent:", error);
      next(error);
    }
  },

  // Handle webhook events from Stripe
  async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        throw new ValidationError("Signature Stripe manquante");
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentSuccess(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentFailure(event.data.object);
          break;
        default:
          logger.info(`Événement non géré: ${event.type}`);
      }

      res.status(200).json({ message: "Webhook traité avec succès" });
    } catch (error) {
      next(error);
    }
  },

  // Get payment history for a user
  async getPaymentHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const bookings = await Booking.find({
        renter: new Types.ObjectId(req.user.userId),
        paymentStatus: "paid",
      })
        .populate("tool", "name")
        .sort({ createdAt: -1 });

      const response: PaymentResponse = {
        message: "Historique des paiements récupéré avec succès",
        bookings,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Refund a payment
  async refundPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { paymentIntentId, amount, reason } = req.body as PaymentData;

      if (!paymentIntentId) {
        throw new ValidationError("L'ID de l'intention de paiement est requis");
      }

      // Vérifier si l'utilisateur a le droit de rembourser ce paiement
      const booking = await Booking.findOne({
        paymentIntentId: paymentIntentId,
      }).populate<{ tool: ITool }>("tool");

      if (!booking) {
        throw new DatabaseError("Paiement non trouvé");
      }

      // Seul l'admin ou le propriétaire de l'outil peut rembourser
      if (
        req.user.role !== "admin" &&
        booking.tool.owner.toString() !== req.user.userId
      ) {
        throw new AuthenticationError("Accès refusé");
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || undefined,
      });

      // Mettre à jour le statut de la réservation
      booking.paymentStatus = "refunded";
      booking.status = "cancelled";
      await booking.save();

      const response: PaymentResponse = {
        message: "Remboursement effectué avec succès",
        refund,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Get payment intent details
  async getPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { paymentIntentId } = req.params;

      if (!paymentIntentId) {
        throw new ValidationError("L'ID de l'intention de paiement est requis");
      }

      // Vérifier si l'utilisateur a le droit de voir ce paiement
      const booking = await Booking.findOne({
        paymentIntentId: paymentIntentId,
      }).populate<{ tool: ITool }>("tool");

      if (!booking) {
        throw new DatabaseError("Paiement non trouvé");
      }

      // Seul l'admin, le propriétaire de l'outil ou le locataire peut voir le paiement
      if (
        req.user.role !== "admin" &&
        booking.tool.owner.toString() !== req.user.userId &&
        booking.renter.toString() !== req.user.userId
      ) {
        throw new AuthenticationError("Accès refusé");
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      const response: PaymentResponse = {
        message: "Détails du paiement récupérés avec succès",
        paymentIntent,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};

// Helper functions for webhook handling
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const booking = await Booking.findOne({
      paymentIntentId: paymentIntent.id,
    });
    if (!booking) {
      logger.error(
        `Aucune réservation trouvée pour le paiement: ${paymentIntent.id}`
      );
      return;
    }

    booking.paymentStatus = "paid";
    booking.status = "active";
    await booking.save();

    // Update tool status
    const tool = await Tool.findById(booking.tool);
    if (tool) {
      tool.status = "rented";
      await tool.save();
    }
  } catch (error) {
    logger.error("Erreur lors du traitement du paiement réussi:", error);
  }
}

async function handlePaymentFailure(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const booking = await Booking.findOne({
      paymentIntentId: paymentIntent.id,
    });
    if (!booking) {
      logger.error(
        `Aucune réservation trouvée pour le paiement: ${paymentIntent.id}`
      );
      return;
    }

    booking.paymentStatus = "pending";
    booking.status = "cancelled";
    await booking.save();

    // Update tool status
    const tool = await Tool.findById(booking.tool);
    if (tool) {
      tool.status = "available";
      await tool.save();
    }
  } catch (error) {
    logger.error("Erreur lors du traitement du paiement échoué:", error);
  }
}
