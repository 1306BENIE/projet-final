"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const index_1 = require("./index");
const logger_1 = require("../utils/logger");
try {
    cloudinary_1.v2.config({
        cloud_name: index_1.config.cloudinary.cloudName,
        api_key: index_1.config.cloudinary.apiKey,
        api_secret: index_1.config.cloudinary.apiSecret,
    });
    logger_1.logger.info("Configuration Cloudinary initialisée avec succès");
}
catch (error) {
    logger_1.logger.error("Erreur lors de l'initialisation de Cloudinary:", error);
    throw new Error("Échec de l'initialisation de Cloudinary");
}
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map