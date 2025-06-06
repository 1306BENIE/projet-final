"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const errorHandler = (fn) => {
    return async (req, res, next) => {
        try {
            return await fn(req, res, next);
        }
        catch (error) {
            // Log détaillé de l'erreur
            logger_1.logger.error("Erreur dans le contrôleur:", {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                },
                request: {
                    path: req.path,
                    method: req.method,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    headers: {
                        ...req.headers,
                        authorization: req.headers.authorization ? "[REDACTED]" : undefined,
                    },
                },
                user: req.user
                    ? {
                        id: req.user.userId,
                        role: req.user.role,
                    }
                    : undefined,
            });
            // Gestion des erreurs spécifiques
            if (error instanceof errors_1.ValidationError) {
                return res.status(400).json({
                    error: "ValidationError",
                    message: error.message,
                    details: error.errors || [],
                });
            }
            if (error instanceof errors_1.AuthenticationError) {
                return res.status(error.code || 401).json({
                    error: "AuthenticationError",
                    message: error.message,
                });
            }
            if (error instanceof errors_1.DatabaseError) {
                return res.status(500).json({
                    error: "DatabaseError",
                    message: "Erreur lors de l'accès à la base de données",
                    details: process.env.NODE_ENV === "development" ? error.message : undefined,
                });
            }
            // Erreur par défaut
            return res.status(500).json({
                error: "InternalServerError",
                message: "Une erreur inattendue est survenue",
                ...(process.env.NODE_ENV === "development" && {
                    details: error.message,
                    stack: error.stack,
                }),
            });
        }
    };
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map