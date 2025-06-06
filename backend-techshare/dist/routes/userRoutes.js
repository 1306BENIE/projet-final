"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_1 = require("../middleware/validate");
const errorHandler_1 = require("../middleware/errorHandler");
const userValidation_1 = require("../validations/userValidation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", (0, validate_1.validateMiddleware)(userValidation_1.registerSchema), (0, errorHandler_1.errorHandler)(controllers_1.userController.register));
router.post("/login", (0, validate_1.validateMiddleware)(userValidation_1.loginSchema), controllers_1.userController.login);
router.post("/request-password-reset", rateLimiter_1.passwordResetLimiter, (0, validate_1.validateMiddleware)(userValidation_1.requestPasswordResetSchema), controllers_1.userController.requestPasswordReset);
router.post("/reset-password", rateLimiter_1.passwordResetSubmitLimiter, (0, validate_1.validateMiddleware)(userValidation_1.resetPasswordSchema), controllers_1.userController.resetPassword);
// Protected routes
router.get("/profile", auth_middleware_1.auth, controllers_1.userController.getProfile);
router.put("/profile", auth_middleware_1.auth, (0, validate_1.validateMiddleware)(userValidation_1.updateProfileSchema), controllers_1.userController.updateProfile);
router.delete("/account", auth_middleware_1.auth, (0, validate_1.validateMiddleware)(userValidation_1.deleteAccountSchema), controllers_1.userController.deleteAccount);
// Admin routes
router.get("/users", auth_middleware_1.adminAuth, (0, validate_1.validateMiddleware)(userValidation_1.userListSchema, "query"), controllers_1.userController.getAllUsers);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map