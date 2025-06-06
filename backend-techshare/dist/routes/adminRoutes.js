"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.use(auth_1.auth, isAdmin_1.isAdmin);
router.get("/users", validatePagination_1.validatePagination, adminController_1.adminController.getUsers);
router.post("/users/:userId/ban", (0, validateObjectId_1.validateObjectId)("userId"), adminController_1.adminController.banUser);
router.post("/users/:userId/unban", (0, validateObjectId_1.validateObjectId)("userId"), adminController_1.adminController.unbanUser);
router.get("/tools", validatePagination_1.validatePagination, adminController_1.adminController.getTools);
router.delete("/tools/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), adminController_1.adminController.deleteTool);
router.get("/reviews", validatePagination_1.validatePagination, adminController_1.adminController.getReviews);
router.delete("/reviews/:reviewId", (0, validateObjectId_1.validateObjectId)("reviewId"), adminController_1.adminController.deleteReview);
router.get("/stats", adminController_1.adminController.getStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map