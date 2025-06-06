"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogService = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const securityLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    status: { type: String, enum: ["success", "failure"], required: true },
    details: { type: mongoose_1.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
});
const SecurityLog = (0, mongoose_1.model)("SecurityLog", securityLogSchema);
class SecurityLogService {
    async logAction(data) {
        try {
            const logData = {
                ...data,
                createdAt: new Date(),
            };
            await SecurityLog.create(logData);
            logger_1.logger.info(`Action de sécurité enregistrée: ${data.action}`, {
                userId: data.userId,
                status: data.status,
            });
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'enregistrement du log de sécurité:", error);
        }
    }
    async logEvent(userId, action, details) {
        try {
            const logData = {
                userId: userId.toString(),
                action,
                ipAddress: "system",
                userAgent: "system",
                status: "success",
                details,
            };
            await this.logAction(logData);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'enregistrement de l'événement:", error);
        }
    }
    async getLogs(query = {}) {
        try {
            return await SecurityLog.find(query)
                .sort({ createdAt: -1 })
                .populate("userId", "firstName lastName email");
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération des logs de sécurité:", error);
            throw error;
        }
    }
}
exports.securityLogService = new SecurityLogService();
//# sourceMappingURL=securityLogService.js.map