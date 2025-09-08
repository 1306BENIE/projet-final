import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { logger } from "../utils/logger";

// Vérification de l'URL Redis
const REDIS_URL = process.env.REDIS_URL;
let redis: Redis | null = null;

if (REDIS_URL) {
  try {
    // Configuration de Redis avec les options nécessaires
    redis = new Redis(REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error("Échec de la connexion Redis après 3 tentatives");
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });
  } catch (error) {
    logger.error("Erreur lors de l'initialisation de Redis:", error);
    redis = null;
  }
} else {
  logger.warn("REDIS_URL n'est pas défini - Rate limiting désactivé");
}

// Fonction pour créer une nouvelle instance de RedisStore
const createRedisStore = (prefix: string) => {
  if (!redis) {
    return undefined; // Pas de store Redis, utilise le store en mémoire par défaut
  }
  
  return new RedisStore({
    // @ts-ignore - Le type RedisStore n'est pas correctement défini
    client: redis,
    prefix: `rate-limit:${prefix}:`,
    // @ts-ignore - Le type SendCommandFn n'est pas correctement défini
    sendCommand: async (...args: [string, ...any[]]) => {
      try {
        if (!redis) throw new Error("Redis non disponible");
        // @ts-ignore - Le type Redis.call n'est pas correctement défini
        return await redis.call(...args);
      } catch (error) {
        logger.error("Erreur Redis sendCommand:", error);
        throw error;
      }
    },
  });
};

// Configuration du rate limiter général
export const rateLimiterMiddleware = rateLimit({
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
export const passwordResetLimiter = rateLimit({
  store: createRedisStore("password-reset"),
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives par heure
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Trop de tentatives de réinitialisation. Veuillez réessayer plus tard.",
  },
});

// Configuration du rate limiter pour la soumission du nouveau mot de passe
export const passwordResetSubmitLimiter = rateLimit({
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
if (redis) {
  redis.on("error", (error) => {
    logger.error("Erreur Redis:", error);
    // Ne pas faire planter l'application
  });

  redis.on("connect", () => {
    logger.info("Connexion Redis établie");
  });

  // Nettoyage à la fermeture
  process.on("SIGTERM", async () => {
    try {
      if (redis) {
        await redis.quit();
        logger.info("Connexion Redis fermée proprement");
      }
    } catch (error) {
      logger.error("Erreur lors de la fermeture de Redis:", error);
    }
    process.exit(0);
  });
}

// Augmenter la limite d'écouteurs
process.setMaxListeners(15);
