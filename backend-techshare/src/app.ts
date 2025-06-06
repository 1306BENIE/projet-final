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
import testRoutes from "./routes/testRoutes";

const app = express();

// Initialisation des services
initializeRecommendationService();

// Configuration de sécurité
app.use(helmet());

// Configuration CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 heures
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
