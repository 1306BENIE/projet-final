import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimiterMiddleware } from "./middleware/rateLimiter";
import { logger } from "./utils/logger";
import { initializeRecommendationService } from "./services/recommendationService";

// Import des routes
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import toolRoutes from "./routes/toolRoutes";
import rentalRoutes from "./routes/rentalRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import searchRoutes from "./routes/searchRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import statsRoutes from "./routes/statsRoutes";
import reportRoutes from "./routes/reportRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import testRoutes from "./routes/testRoutes";

const app = express();

// Initialisation des services
initializeRecommendationService();

// Configuration de sécurité
app.use(helmet());

// Configuration CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://projet-final-rgb0l9w6v-benies-projects-e2ceedb8.vercel.app",
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Vérifier si l'origin est dans la liste autorisée
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // En développement, permettre tous les origins localhost
      if (process.env.NODE_ENV === "development" && origin.includes("localhost")) {
        return callback(null, true);
      }
      
      // Permettre les domaines Vercel en production
      if (origin.includes("vercel.app") || origin.includes("benies-projects")) {
        return callback(null, true);
      }
      
      callback(new Error("Non autorisé par la politique CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400, // 24 heures
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Middleware de base
app.use(express.json({ limit: "10mb" })); // Limite la taille des requêtes JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Limite la taille des requêtes URL-encoded
app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);
app.use(rateLimiterMiddleware);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/test", testRoutes);

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  });
});

// Gestion globale des erreurs
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Une erreur est survenue";
  const errorDetails = {
    message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details,
    }),
  };

  logger.error("Erreur globale:", {
    ...errorDetails,
    error: err,
  });

  res.status(status).json(errorDetails);
});

export default app;
