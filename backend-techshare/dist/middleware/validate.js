"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMiddleware = void 0;
const logger_1 = require("../utils/logger");
const validateMiddleware = (schema, type = "body") => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req[type], {
                abortEarly: false,
                stripUnknown: true,
                allowUnknown: false,
            });
            if (error) {
                const errors = error.details.map((detail) => ({
                    field: detail.path.join("."),
                    message: detail.message,
                }));
                logger_1.logger.warn("Erreur de validation:", {
                    type,
                    errors,
                    data: req[type],
                });
                return res.status(400).json({
                    error: "ValidationError",
                    message: "Erreur de validation des données",
                    details: errors,
                });
            }
            return next();
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la validation:", {
                error,
                type,
                data: req[type],
            });
            return res.status(500).json({
                error: "ValidationError",
                message: "Erreur lors de la validation des données",
            });
        }
    };
};
exports.validateMiddleware = validateMiddleware;
//# sourceMappingURL=validate.js.map