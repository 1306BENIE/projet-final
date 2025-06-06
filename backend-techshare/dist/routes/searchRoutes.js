"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searchController_1 = require("../controllers/searchController");
const router = express_1.default.Router();
router.get("/tools", searchController_1.searchController.searchTools);
router.get("/tools/popular", searchController_1.searchController.getPopularTools);
router.get("/tools/nearby", searchController_1.searchController.getNearbyTools);
exports.default = router;
//# sourceMappingURL=searchRoutes.js.map