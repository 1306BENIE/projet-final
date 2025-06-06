"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validate_1 = require("../middleware/validate");
const validatePagination_1 = require("../middleware/validatePagination");
const notificationValidation_1 = require("../validations/notificationValidation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get("/", auth_1.auth, validatePagination_1.validatePagination, (0, validate_1.validateMiddleware)(notificationValidation_1.notificationValidation.getUserNotifications), (0, errorHandler_1.errorHandler)(controllers_1.notificationController.getUserNotifications));
router.get("/unread", auth_1.auth, validatePagination_1.validatePagination, (0, validate_1.validateMiddleware)(notificationValidation_1.notificationValidation.getUserNotifications), (0, errorHandler_1.errorHandler)(controllers_1.notificationController.getUnreadNotifications));
router.get("/unread/count", auth_1.auth, (0, errorHandler_1.errorHandler)(controllers_1.notificationController.getUnreadCount));
router.put("/:id/read", auth_1.auth, (0, validateObjectId_1.validateObjectId)("id"), (0, validate_1.validateMiddleware)(notificationValidation_1.notificationValidation.markAsRead), (0, errorHandler_1.errorHandler)(controllers_1.notificationController.markAsRead));
router.put("/read-all", auth_1.auth, (0, errorHandler_1.errorHandler)(controllers_1.notificationController.markAllAsRead));
router.delete("/:id", auth_1.auth, (0, validateObjectId_1.validateObjectId)("id"), (0, validate_1.validateMiddleware)(notificationValidation_1.notificationValidation.deleteNotification), (0, errorHandler_1.errorHandler)(controllers_1.notificationController.deleteNotification));
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map