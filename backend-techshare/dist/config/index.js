"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
// Charger les variables d'environnement
dotenv_1.default.config();
// Vérifier les variables d'environnement requises
const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    logger_1.logger.error("Variables d'environnement manquantes:", {
        missing: missingEnvVars,
    });
    throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(", ")}`);
}
exports.config = {
    port: parseInt(process.env.PORT || "3000"),
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    email: {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        user: process.env.EMAIL_USER || "dummy@example.com",
        password: process.env.EMAIL_PASSWORD || "dummy-password",
        from: process.env.EMAIL_FROM || "noreply@techshare.com",
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    redis: {
        url: process.env.REDIS_URL || "redis://localhost:6379",
    },
};
// Valider la configuration
try {
    if (!exports.config.jwtSecret || exports.config.jwtSecret === "your-secret-key") {
        throw new Error("JWT_SECRET doit être défini et différent de la valeur par défaut");
    }
    if (!exports.config.stripe.secretKey || !exports.config.stripe.webhookSecret) {
        throw new Error("Les clés Stripe sont requises");
    }
    if (!exports.config.cloudinary.cloudName ||
        !exports.config.cloudinary.apiKey ||
        !exports.config.cloudinary.apiSecret) {
        throw new Error("Les identifiants Cloudinary sont requis");
    }
    logger_1.logger.info("Configuration validée avec succès");
}
catch (error) {
    logger_1.logger.error("Erreur de validation de la configuration:", error);
    throw error;
}
//# sourceMappingURL=index.js.map