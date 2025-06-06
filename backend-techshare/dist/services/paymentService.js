"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const stripe = new stripe_1.default(config_1.config.stripe.secretKey, {
    apiVersion: "2025-05-28.basil",
});
class PaymentService {
    async createPaymentIntent(amount, currency = "eur") {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe utilise les centimes
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la création du paiement:", error);
            throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
        }
    }
    async refundPayment(paymentIntentId) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
            return refund;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du remboursement:", error);
            throw new Error(`Erreur lors du remboursement: ${error.message}`);
        }
    }
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération du paiement:", error);
            throw new Error(`Erreur lors de la récupération du paiement: ${error.message}`);
        }
    }
    async handleWebhook(event) {
        try {
            switch (event.type) {
                case "payment_intent.succeeded":
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case "payment_intent.payment_failed":
                    await this.handlePaymentFailure(event.data.object);
                    break;
                default:
                    logger_1.logger.info(`Événement non géré: ${event.type}`);
            }
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du traitement du webhook:", error);
            throw new Error(`Erreur lors du traitement du webhook: ${error.message}`);
        }
    }
    async handlePaymentSuccess(paymentIntent) {
        // Logique pour gérer le succès du paiement
        logger_1.logger.info(`Paiement réussi: ${paymentIntent.id}`);
    }
    async handlePaymentFailure(paymentIntent) {
        // Logique pour gérer l'échec du paiement
        logger_1.logger.info(`Échec du paiement: ${paymentIntent.id}`);
    }
}
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map