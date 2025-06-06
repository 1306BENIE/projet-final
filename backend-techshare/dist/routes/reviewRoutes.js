"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validations_1 = require("../validations");
const reviewController_1 = require("../controllers/reviewController");
const errorHandler_1 = require("../middleware/errorHandler");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const router = express_1.default.Router();
router.post("/", auth_1.auth, validations_1.validateReview, (0, errorHandler_1.errorHandler)(reviewController_1.reviewController.createReview));
router.get("/tool/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(reviewController_1.reviewController.getReviewsByTool));
router.get("/user/:userId", (0, validateObjectId_1.validateObjectId)("userId"), validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(reviewController_1.reviewController.getReviewsByUser));
router.put("/:reviewId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("reviewId"), validations_1.validateReview, (0, errorHandler_1.errorHandler)(reviewController_1.reviewController.updateReview));
router.delete("/:reviewId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("reviewId"), (0, errorHandler_1.errorHandler)(reviewController_1.reviewController.deleteReview));
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map