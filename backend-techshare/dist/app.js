"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./utils/logger");
const recommendationService_1 = require("./services/recommendationService");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const toolRoutes_1 = __importDefault(require("./routes/toolRoutes"));
const rentalRoutes_1 = __importDefault(require("./routes/rentalRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const app = (0, express_1.default)();
(0, recommendationService_1.initializeRecommendationService)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, morgan_1.default)("dev", {
    stream: {
        write: (message) => logger_1.logger.info(message.trim()),
    },
}));
app.use(rateLimiter_1.rateLimiterMiddleware);
app.use("/api/users", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/tools", toolRoutes_1.default);
app.use("/api/rentals", rentalRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/search", searchRoutes_1.default);
app.use("/api/recommendations", recommendationRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/stats", statsRoutes_1.default);
app.use("/api/reports", reportRoutes_1.default);
app.use("/api/test", testRoutes_1.default);
app.use((req, res) => {
    logger_1.logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "Route non trouvée",
        path: req.originalUrl,
        method: req.method,
    });
});
app.use((err, req, res, _next) => {
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
    logger_1.logger.error("Erreur globale:", {
        ...errorDetails,
        error: err,
    });
    res.status(status).json(errorDetails);
});
exports.default = app;
//# sourceMappingURL=app.js.map