import Stripe from "stripe";
import { config } from "../config";
import { logger } from "../utils/logger";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-05-28.basil",
});

class PaymentService {
  async createPaymentIntent(
    amount: number,
    currency: string = "eur"
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      logger.error("Erreur lors de la création du paiement:", error);
      throw new Error(
        `Erreur lors de la création du paiement: ${error.message}`
      );
    }
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return refund;
    } catch (error) {
      logger.error("Erreur lors du remboursement:", error);
      throw new Error(`Erreur lors du remboursement: ${error.message}`);
    }
  }

  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent;
    } catch (error) {
      logger.error("Erreur lors de la récupération du paiement:", error);
      throw new Error(
        `Erreur lors de la récupération du paiement: ${error.message}`
      );
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSuccess(
            event.data.object as Stripe.PaymentIntent
          );
          break;
        case "payment_intent.payment_failed":
          await this.handlePaymentFailure(
            event.data.object as Stripe.PaymentIntent
          );
          break;
        default:
          logger.info(`Événement non géré: ${event.type}`);
      }
    } catch (error) {
      logger.error("Erreur lors du traitement du webhook:", error);
      throw new Error(`Erreur lors du traitement du webhook: ${error.message}`);
    }
  }

  private async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Logique pour gérer le succès du paiement
    logger.info(`Paiement réussi: ${paymentIntent.id}`);
  }

  private async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Logique pour gérer l'échec du paiement
    logger.info(`Échec du paiement: ${paymentIntent.id}`);
  }
}

export const paymentService = new PaymentService();
