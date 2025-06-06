"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserController = void 0;
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const securityLogService_1 = require("../services/securityLogService");
const handleError = (error, res, message) => {
    logger_1.logger.error(`${message}:`, error);
    if (error.name === "ValidationError") {
        res.status(400).json({
            message: "Erreur de validation",
            errors: Object.values(error.errors).map((err) => err.message),
        });
        return;
    }
    res.status(500).json({ message });
    return;
};
exports.adminUserController = {
    async getAllUsers(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", search, role, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let query = {};
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            if (role) {
                query.role = role;
            }
            const users = await User_1.User.find(query)
                .select("-password")
                .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
                .skip(skip)
                .limit(Number(limit));
            const total = await User_1.User.countDocuments(query);
            res.json({
                users,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            handleError(error, res, "Error fetching users");
        }
    },
    async banUser(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await User_1.User.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            user.isBanned = true;
            await user.save();
            await securityLogService_1.securityLogService.logAction({
                action: "BAN_USER",
                userId: req.user.userId,
                ipAddress: req.ip || "unknown",
                userAgent: req.headers["user-agent"] || "unknown",
                status: "success",
                details: { targetUser: userId, reason },
            });
            res.json({ message: "User banned successfully" });
        }
        catch (error) {
            handleError(error, res, "Error banning user");
        }
    },
    async unbanUser(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { userId } = req.params;
            const user = await User_1.User.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            user.isBanned = false;
            await user.save();
            await securityLogService_1.securityLogService.logAction({
                action: "UNBAN_USER",
                userId: req.user.userId,
                ipAddress: req.ip || "unknown",
                userAgent: req.headers["user-agent"] || "unknown",
                status: "success",
                details: { targetUser: userId },
            });
            res.json({ message: "User unbanned successfully" });
        }
        catch (error) {
            handleError(error, res, "Error unbanning user");
        }
    },
};
//# sourceMappingURL=adminUserController.js.map