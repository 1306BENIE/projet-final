"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookMiddleware = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const stripe = new stripe_1.default(config_1.config.stripe.secretKey, {
    apiVersion: "2025-05-28.basil",
});
const stripeWebhookMiddleware = async (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        return res.status(400).json({ message: "Signature Stripe manquante" });
    }
    try {
        const event = stripe.webhooks.constructEvent(req.body, signature, config_1.config.stripe.webhookSecret);
        req.body = event;
        return next();
    }
    catch (error) {
        logger_1.logger.error("Erreur de validation du webhook Stripe:", error);
        return res.status(400).json({ message: "Signature Stripe invalide" });
    }
};
exports.stripeWebhookMiddleware = stripeWebhookMiddleware;
//# sourceMappingURL=stripeWebhook.js.map