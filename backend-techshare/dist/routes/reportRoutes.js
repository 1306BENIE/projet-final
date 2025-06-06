"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/security-logs", auth_1.auth, controllers_1.reportController.getSecurityLogs);
router.get("/activity-logs", auth_1.auth, controllers_1.reportController.getActivityLogs);
router.get("/error-logs", auth_1.auth, controllers_1.reportController.getErrorLogs);
router.get("/user-activity/:userId", auth_1.auth, controllers_1.reportController.getUserActivity);
router.get("/tool-activity/:toolId", auth_1.auth, controllers_1.reportController.getToolActivity);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map