"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const recommendationController_1 = require("../controllers/recommendationController");
const router = express_1.default.Router();
router.get("/personalized", auth_1.auth, validatePagination_1.validatePagination, recommendationController_1.recommendationController.getPersonalizedRecommendations);
router.get("/similar/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), validatePagination_1.validatePagination, recommendationController_1.recommendationController.getSimilarTools);
router.get("/popular", validatePagination_1.validatePagination, recommendationController_1.recommendationController.getPopularTools);
exports.default = router;
//# sourceMappingURL=recommendationRoutes.js.map