"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetSubmitLimiter = exports.passwordResetLimiter = exports.rateLimiterMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
// Vérification de l'URL Redis
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
    logger_1.logger.error("REDIS_URL n'est pas défini dans les variables d'environnement");
    throw new Error("REDIS_URL est requis pour le rate limiting");
}
// Configuration de Redis avec les options nécessaires
const redis = new ioredis_1.default(REDIS_URL, {
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            logger_1.logger.error("Échec de la connexion Redis après 3 tentatives");
            return null;
        }
        return Math.min(times * 100, 3000);
    },
});
// Fonction pour créer une nouvelle instance de RedisStore
const createRedisStore = (prefix) => {
    return new rate_limit_redis_1.default({
        // @ts-ignore - Le type RedisStore n'est pas correctement défini
        client: redis,
        prefix: `rate-limit:${prefix}:`,
        // @ts-ignore - Le type SendCommandFn n'est pas correctement défini
        sendCommand: async (...args) => {
            try {
                // @ts-ignore - Le type Redis.call n'est pas correctement défini
                return await redis.call(...args);
            }
            catch (error) {
                logger_1.logger.error("Erreur Redis sendCommand:", error);
                throw error;
            }
        },
    });
};
// Configuration du rate limiter général
exports.rateLimiterMiddleware = (0, express_rate_limit_1.default)({
    store: createRedisStore("general"),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Trop de requêtes. Veuillez réessayer plus tard.",
    },
});
// Configuration du rate limiter pour la réinitialisation du mot de passe
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore("password-reset"),
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // 3 tentatives par heure
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Trop de tentatives de réinitialisation. Veuillez réessayer plus tard.",
    },
});
// Configuration du rate limiter pour la soumission du nouveau mot de passe
exports.passwordResetSubmitLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore("password-reset-submit"),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Trop de tentatives de soumission. Veuillez réessayer plus tard.",
    },
});
// Gestion des événements Redis
redis.on("error", (error) => {
    logger_1.logger.error("Erreur Redis:", error);
});
redis.on("connect", () => {
    logger_1.logger.info("Connexion Redis établie");
});
// Nettoyage à la fermeture
process.on("SIGTERM", async () => {
    try {
        await redis.quit();
        logger_1.logger.info("Connexion Redis fermée proprement");
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la fermeture de Redis:", error);
    }
    process.exit(0);
});
// Augmenter la limite d'écouteurs
process.setMaxListeners(15);
//# sourceMappingURL=rateLimiter.js.map