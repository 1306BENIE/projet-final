"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searchController_1 = require("../controllers/searchController");
const router = express_1.default.Router();
// Route de recherche avancée
router.get("/tools", searchController_1.searchController.searchTools);
// Route pour les outils populaires
router.get("/tools/popular", searchController_1.searchController.getPopularTools);
// Route pour les outils à proximité
router.get("/tools/nearby", searchController_1.searchController.getNearbyTools);
exports.default = router;
//# sourceMappingURL=searchRoutes.js.map