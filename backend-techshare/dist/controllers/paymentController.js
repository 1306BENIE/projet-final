"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
const mongoose_1 = require("mongoose");
const errors_1 = require("../utils/errors");
// Vérification de la clé secrète Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}
const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: "2025-05-28.basil" });
exports.paymentController = {
    // Create payment intent
    async createPaymentIntent(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { rentalId } = req.body;
            if (!rentalId) {
                throw new errors_1.ValidationError("L'ID de la location est requis");
            }
            const rental = await models_1.Rental.findById(rentalId).populate("tool");
            if (!rental) {
                throw new errors_1.DatabaseError("Location non trouvée");
            }
            // Check if user is the renter
            if (rental.renter.toString() !== req.user.userId) {
                throw new errors_1.AuthenticationError("Accès refusé");
            }
            // Check if payment is already completed
            if (rental.paymentStatus === "paid") {
                throw new errors_1.ValidationError("Le paiement a déjà été effectué");
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(rental.totalPrice * 100), // Convert to cents and ensure integer
                currency: "eur",
                metadata: {
                    rentalId: rental._id.toString(),
                    userId: req.user.userId,
                },
            });
            // Update rental with payment intent ID
            rental.stripePaymentId = paymentIntent.id;
            await rental.save();
            const response = {
                message: "Intention de paiement créée avec succès",
                clientSecret: paymentIntent.client_secret || undefined,
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Handle webhook events from Stripe
    async handleWebhook(req, res, next) {
        try {
            const sig = req.headers["stripe-signature"];
            if (!sig) {
                throw new errors_1.ValidationError("Signature Stripe manquante");
            }
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
            }
            const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            // Handle the event
            switch (event.type) {
                case "payment_intent.succeeded":
                    await handlePaymentSuccess(event.data.object);
                    break;
                case "payment_intent.payment_failed":
                    await handlePaymentFailure(event.data.object);
                    break;
                default:
                    logger_1.logger.info(`Événement non géré: ${event.type}`);
            }
            res.status(200).json({ message: "Webhook traité avec succès" });
        }
        catch (error) {
            next(error);
        }
    },
    // Get payment history for a user
    async getPaymentHistory(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const rentals = await models_1.Rental.find({
                renter: new mongoose_1.Types.ObjectId(req.user.userId),
                paymentStatus: "paid",
            })
                .populate("tool", "name")
                .sort({ createdAt: -1 });
            const response = {
                message: "Historique des paiements récupéré avec succès",
                rentals,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Refund a payment
    async refundPayment(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { paymentIntentId, amount, reason } = req.body;
            if (!paymentIntentId) {
                throw new errors_1.ValidationError("L'ID de l'intention de paiement est requis");
            }
            // Vérifier si l'utilisateur a le droit de rembourser ce paiement
            const rental = await models_1.Rental.findOne({
                stripePaymentId: paymentIntentId,
            }).populate("tool");
            if (!rental) {
                throw new errors_1.DatabaseError("Paiement non trouvé");
            }
            // Seul l'admin ou le propriétaire de l'outil peut rembourser
            if (req.user.role !== "admin" &&
                rental.tool.owner.toString() !== req.user.userId) {
                throw new errors_1.AuthenticationError("Accès refusé");
            }
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason: reason || undefined,
            });
            // Mettre à jour le statut de la location
            rental.paymentStatus = "refunded";
            rental.status = "cancelled";
            await rental.save();
            const response = {
                message: "Remboursement effectué avec succès",
                refund,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Get payment intent details
    async getPaymentIntent(req, res, next) {
        try {
            if (!req.user?.userId) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { paymentIntentId } = req.params;
            if (!paymentIntentId) {
                throw new errors_1.ValidationError("L'ID de l'intention de paiement est requis");
            }
            // Vérifier si l'utilisateur a le droit de voir ce paiement
            const rental = await models_1.Rental.findOne({
                stripePaymentId: paymentIntentId,
            }).populate("tool");
            if (!rental) {
                throw new errors_1.DatabaseError("Paiement non trouvé");
            }
            // Seul l'admin, le propriétaire de l'outil ou le locataire peut voir le paiement
            if (req.user.role !== "admin" &&
                rental.tool.owner.toString() !== req.user.userId &&
                rental.renter.toString() !== req.user.userId) {
                throw new errors_1.AuthenticationError("Accès refusé");
            }
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const response = {
                message: "Détails du paiement récupérés avec succès",
                paymentIntent,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
// Helper functions for webhook handling
async function handlePaymentSuccess(paymentIntent) {
    try {
        const rental = await models_1.Rental.findOne({ stripePaymentId: paymentIntent.id });
        if (!rental) {
            logger_1.logger.error(`Aucune location trouvée pour le paiement: ${paymentIntent.id}`);
            return;
        }
        rental.paymentStatus = "paid";
        rental.status = "active";
        await rental.save();
        // Update tool status
        const tool = await models_1.Tool.findById(rental.tool);
        if (tool) {
            tool.status = "rented";
            await tool.save();
        }
    }
    catch (error) {
        logger_1.logger.error("Erreur lors du traitement du paiement réussi:", error);
    }
}
async function handlePaymentFailure(paymentIntent) {
    try {
        const rental = await models_1.Rental.findOne({ stripePaymentId: paymentIntent.id });
        if (!rental) {
            logger_1.logger.error(`Aucune location trouvée pour le paiement: ${paymentIntent.id}`);
            return;
        }
        rental.paymentStatus = "pending";
        rental.status = "cancelled";
        await rental.save();
        // Update tool status
        const tool = await models_1.Tool.findById(rental.tool);
        if (tool) {
            tool.status = "available";
            await tool.save();
        }
    }
    catch (error) {
        logger_1.logger.error("Erreur lors du traitement du paiement échoué:", error);
    }
}
//# sourceMappingURL=paymentController.js.map