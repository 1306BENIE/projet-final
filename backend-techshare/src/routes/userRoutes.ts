import { Router } from "express";
import { userController } from "../controllers";
import { auth, adminAuth } from "../middleware/auth.middleware";
import { validateMiddleware as validate } from "../middleware/validate";
import { errorHandler } from "../middleware/errorHandler";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  userListSchema,
  deleteAccountSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validations/userValidation";
import {
  passwordResetLimiter,
  passwordResetSubmitLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(registerSchema),
  errorHandler(userController.register)
);
router.post("/login", validate(loginSchema), userController.login);
router.post(
  "/request-password-reset",
  passwordResetLimiter,
  validate(requestPasswordResetSchema),
  userController.requestPasswordReset
);
router.post(
  "/reset-password",
  passwordResetSubmitLimiter,
  validate(resetPasswordSchema),
  userController.resetPassword
);

// Protected routes
router.get("/profile", auth, userController.getProfile);
router.put(
  "/profile",
  auth,
  validate(updateProfileSchema),
  userController.updateProfile
);
router.delete(
  "/account",
  auth,
  validate(deleteAccountSchema),
  userController.deleteAccount
);

// Admin routes
router.get(
  "/users",
  adminAuth,
  validate(userListSchema, "query"),
  userController.getAllUsers
);

export default router;
