"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
// Route de test pour vérifier la connexion
router.get("/ping", (_req, res) => {
    logger_1.logger.info("Test de connexion effectué");
    res.json({
        message: "Connexion réussie !",
        timestamp: new Date().toISOString(),
        status: "success",
    });
});
exports.default = router;
//# sourceMappingURL=testRoutes.js.map