import { Router } from "express";
import { paymentController } from "../controllers";
import { auth } from "../middleware/auth";
import { validateMiddleware } from "../middleware/validate";
import { errorHandler } from "../middleware/errorHandler";
import {
  createPaymentIntentSchema,
  refundPaymentSchema,
  webhookSchema,
  getPaymentIntentSchema,
  getPaymentHistorySchema,
} from "../validations/paymentValidation";
import { stripeWebhookMiddleware } from "../middleware/stripeWebhook";

const router = Router();

// Protected routes
router.post(
  "/create-intent",
  auth,
  validateMiddleware(createPaymentIntentSchema),
  errorHandler(paymentController.createPaymentIntent)
);

router.post(
  "/refund",
  auth,
  validateMiddleware(refundPaymentSchema),
  errorHandler(paymentController.refundPayment)
);

router.get(
  "/intent/:paymentIntentId",
  auth,
  validateMiddleware(getPaymentIntentSchema),
  errorHandler(paymentController.getPaymentIntent)
);

router.get(
  "/history",
  auth,
  validateMiddleware(getPaymentHistorySchema),
  errorHandler(paymentController.getPaymentHistory)
);

// Webhook route (pas d'authentification car appelé par Stripe)
router.post(
  "/webhook",
  stripeWebhookMiddleware,
  validateMiddleware(webhookSchema),
  errorHandler(paymentController.handleWebhook)
);

export default router;
