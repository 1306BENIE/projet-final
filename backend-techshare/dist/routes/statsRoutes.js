"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Routes protégées (admin uniquement)
router.get("/dashboard", auth_1.auth, controllers_1.statsController.getDashboardStats);
router.get("/tools", auth_1.auth, controllers_1.statsController.getToolStats);
router.get("/users", auth_1.auth, controllers_1.statsController.getUserStats);
router.get("/rentals", auth_1.auth, controllers_1.statsController.getRentalStats);
router.get("/revenue", auth_1.auth, controllers_1.statsController.getRevenueStats);
router.get("/categories", auth_1.auth, controllers_1.statsController.getCategoryStats);
exports.default = router;
//# sourceMappingURL=statsRoutes.js.map