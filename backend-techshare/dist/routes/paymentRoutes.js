"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const errorHandler_1 = require("../middleware/errorHandler");
const paymentValidation_1 = require("../validations/paymentValidation");
const stripeWebhook_1 = require("../middleware/stripeWebhook");
const router = (0, express_1.Router)();
// Protected routes
router.post("/create-intent", auth_1.auth, (0, validate_1.validateMiddleware)(paymentValidation_1.createPaymentIntentSchema), (0, errorHandler_1.errorHandler)(controllers_1.paymentController.createPaymentIntent));
router.post("/refund", auth_1.auth, (0, validate_1.validateMiddleware)(paymentValidation_1.refundPaymentSchema), (0, errorHandler_1.errorHandler)(controllers_1.paymentController.refundPayment));
router.get("/intent/:paymentIntentId", auth_1.auth, (0, validate_1.validateMiddleware)(paymentValidation_1.getPaymentIntentSchema), (0, errorHandler_1.errorHandler)(controllers_1.paymentController.getPaymentIntent));
router.get("/history", auth_1.auth, (0, validate_1.validateMiddleware)(paymentValidation_1.getPaymentHistorySchema), (0, errorHandler_1.errorHandler)(controllers_1.paymentController.getPaymentHistory));
// Webhook route (pas d'authentification car appelé par Stripe)
router.post("/webhook", stripeWebhook_1.stripeWebhookMiddleware, (0, validate_1.validateMiddleware)(paymentValidation_1.webhookSchema), (0, errorHandler_1.errorHandler)(controllers_1.paymentController.handleWebhook));
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map