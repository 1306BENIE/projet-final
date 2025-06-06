"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const securityLogService_1 = require("../services/securityLogService");
const logger_1 = require("../utils/logger");
const Rental_1 = require("../models/Rental");
const Tool_1 = require("../models/Tool");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
// Ajouter un gestionnaire d'erreurs centralisé
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
exports.reportController = {
    // Get security logs (admin only)
    async getSecurityLogs(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { startDate, endDate, action, userId } = req.query;
            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            if (action)
                query.action = action;
            if (userId)
                query.userId = userId;
            const logs = await securityLogService_1.securityLogService.getLogs(query);
            res.json(logs);
        }
        catch (error) {
            handleError(error, res, "Error fetching security logs");
        }
    },
    // Generate activity report (admin only)
    async generateActivityReport(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            const [newUsers, newTools, newRentals, completedRentals, revenue] = await Promise.all([
                User_1.User.countDocuments({ ...query, createdAt: { $exists: true } }),
                Tool_1.Tool.countDocuments({ ...query, createdAt: { $exists: true } }),
                Rental_1.Rental.countDocuments({ ...query, createdAt: { $exists: true } }),
                Rental_1.Rental.countDocuments({ ...query, status: "completed" }),
                Rental_1.Rental.aggregate([
                    { $match: { ...query, paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
            ]);
            res.json({
                period: {
                    start: startDate || "all time",
                    end: endDate || "now",
                },
                metrics: {
                    newUsers,
                    newTools,
                    newRentals,
                    completedRentals,
                    revenue: revenue[0]?.total || 0,
                },
            });
        }
        catch (error) {
            handleError(error, res, "Error generating activity report");
        }
    },
    // Generate user report (admin only)
    async generateUserReport(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { userId } = req.params;
            const user = await User_1.User.findById(userId).select("-password");
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const [ownedTools, activeRentals, completedRentals, totalSpent, securityLogs,] = await Promise.all([
                Tool_1.Tool.countDocuments({ owner: userId }),
                Rental_1.Rental.countDocuments({ renter: userId, status: "active" }),
                Rental_1.Rental.countDocuments({ renter: userId, status: "completed" }),
                Rental_1.Rental.aggregate([
                    { $match: { renter: userId, paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
                securityLogService_1.securityLogService.getLogs({ userId }),
            ]);
            res.json({
                user,
                activity: {
                    ownedTools,
                    rentals: {
                        active: activeRentals,
                        completed: completedRentals,
                    },
                    totalSpent: totalSpent[0]?.total || 0,
                },
                securityLogs,
            });
        }
        catch (error) {
            handleError(error, res, "Error generating user report");
        }
    },
    // Generate tool report (admin only)
    async generateToolReport(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { toolId } = req.params;
            const tool = await Tool_1.Tool.findById(toolId).populate("owner", "firstName lastName email");
            if (!tool) {
                res.status(404).json({ message: "Tool not found" });
                return;
            }
            const [totalRentals, activeRentals, completedRentals, totalRevenue, securityLogs,] = await Promise.all([
                Rental_1.Rental.countDocuments({ tool: toolId }),
                Rental_1.Rental.countDocuments({ tool: toolId, status: "active" }),
                Rental_1.Rental.countDocuments({ tool: toolId, status: "completed" }),
                Rental_1.Rental.aggregate([
                    { $match: { tool: toolId, paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
                securityLogService_1.securityLogService.getLogs({ toolId }),
            ]);
            res.json({
                tool,
                activity: {
                    rentals: {
                        total: totalRentals,
                        active: activeRentals,
                        completed: completedRentals,
                    },
                    totalRevenue: totalRevenue[0]?.total || 0,
                },
                securityLogs,
            });
        }
        catch (error) {
            handleError(error, res, "Error generating tool report");
        }
    },
    // Get activity logs (admin only)
    async getActivityLogs(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { startDate, endDate, type } = req.query;
            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            if (type)
                query.type = type;
            const logs = await securityLogService_1.securityLogService.getLogs({
                ...query,
                type: "activity",
            });
            res.json(logs);
        }
        catch (error) {
            handleError(error, res, "Error fetching activity logs");
        }
    },
    // Get error logs (admin only)
    async getErrorLogs(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { startDate, endDate, level } = req.query;
            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            if (level)
                query.level = level;
            const logs = await securityLogService_1.securityLogService.getLogs({
                ...query,
                type: "error",
            });
            res.json(logs);
        }
        catch (error) {
            handleError(error, res, "Error fetching error logs");
        }
    },
    // Get user activity (admin only)
    async getUserActivity(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const query = { userId };
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            const [securityLogs, rentals, tools] = await Promise.all([
                securityLogService_1.securityLogService.getLogs(query),
                Rental_1.Rental.find({ renter: userId, ...query }).sort({ createdAt: -1 }),
                Tool_1.Tool.find({ owner: userId, ...query }).sort({ createdAt: -1 }),
            ]);
            res.json({
                securityLogs,
                rentals,
                tools,
            });
        }
        catch (error) {
            handleError(error, res, "Error fetching user activity");
        }
    },
    // Get tool activity (admin only)
    async getToolActivity(req, res) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                res.status(403).json({ message: "Admin access required" });
                return;
            }
            const { toolId } = req.params;
            const { startDate, endDate } = req.query;
            const query = { toolId };
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            const [securityLogs, rentals, reviews] = await Promise.all([
                securityLogService_1.securityLogService.getLogs(query),
                Rental_1.Rental.find({ tool: toolId, ...query }).sort({ createdAt: -1 }),
                Review_1.Review.find({ tool: toolId, ...query }).sort({ createdAt: -1 }),
            ]);
            res.json({
                securityLogs,
                rentals,
                reviews,
            });
        }
        catch (error) {
            handleError(error, res, "Error fetching tool activity");
        }
    },
};
//# sourceMappingURL=reportController.js.map