"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const securityLogService_1 = require("../services/securityLogService");
const logger_1 = require("../utils/logger");
const Rental_1 = require("../models/Rental");
const Tool_1 = require("../models/Tool");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
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
    async getSecurityLogs(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
    async generateActivityReport(req, res) {
        var _a, _b;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
                    revenue: ((_b = revenue[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                },
            });
        }
        catch (error) {
            handleError(error, res, "Error generating activity report");
        }
    },
    async generateUserReport(req, res) {
        var _a, _b;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
                    totalSpent: ((_b = totalSpent[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                },
                securityLogs,
            });
        }
        catch (error) {
            handleError(error, res, "Error generating user report");
        }
    },
    async generateToolReport(req, res) {
        var _a, _b;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
                    totalRevenue: ((_b = totalRevenue[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                },
                securityLogs,
            });
        }
        catch (error) {
            handleError(error, res, "Error generating tool report");
        }
    },
    async getActivityLogs(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
    async getErrorLogs(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
    async getUserActivity(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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
    async getToolActivity(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== "admin") {
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