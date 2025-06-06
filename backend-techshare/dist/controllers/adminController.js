"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const Tool_1 = require("../models/Tool");
const Review_1 = require("../models/Review");
const Rental_1 = require("../models/Rental");
const logger_1 = require("../utils/logger");
const securityLogService_1 = require("../services/securityLogService");
const errors_1 = require("../utils/errors");
// Constantes de validation
const MIN_PAGE = 1;
const MAX_PAGE = 100;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;
// Gestionnaire d'erreurs centralisé
const handleError = (error, res, next, message) => {
    logger_1.logger.error(`${message}:`, error);
    if (error.name === "ValidationError") {
        res.status(400).json({
            message: "Erreur de validation",
            errors: Object.values(error.errors).map((err) => err.message),
        });
        return;
    }
    if (error.name === "DatabaseError") {
        res.status(500).json({
            message: "Erreur de base de données",
            error: error.message,
        });
        return;
    }
    next(error);
};
// Middleware de vérification des droits admin
const checkAdminAccess = (req) => {
    if (!req.user?.userId || req.user.role !== "admin") {
        throw new errors_1.ValidationError("Accès administrateur requis");
    }
};
exports.adminController = {
    // Get all users
    async getUsers(req, res, next) {
        try {
            checkAdminAccess(req);
            const { page = 1, limit = 20, search, role, isBanned } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            if (pageNum < MIN_PAGE ||
                pageNum > MAX_PAGE ||
                limitNum < MIN_LIMIT ||
                limitNum > MAX_LIMIT) {
                throw new errors_1.ValidationError(`La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`);
            }
            const filter = {};
            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            if (role)
                filter.role = role;
            if (isBanned !== undefined)
                filter.isBanned = isBanned === "true";
            const [users, total] = await Promise.all([
                User_1.User.find(filter)
                    .select("-password")
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                User_1.User.countDocuments(filter),
            ]);
            const response = {
                message: "Utilisateurs récupérés avec succès",
                data: users,
                metadata: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la récupération des utilisateurs");
        }
    },
    // Ban user
    async banUser(req, res, next) {
        try {
            checkAdminAccess(req);
            const { userId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new errors_1.ValidationError("ID utilisateur invalide");
            }
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new errors_1.ValidationError("Utilisateur non trouvé");
            }
            if (user.isBanned) {
                throw new errors_1.ValidationError("L'utilisateur est déjà banni");
            }
            user.isBanned = true;
            await user.save();
            // Log de l'événement
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "BAN_USER", JSON.stringify({
                    targetUserId: userId,
                    reason: req.body.reason || "Non spécifié",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Utilisateur banni avec succès",
                data: { userId: user._id, email: user.email },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors du bannissement de l'utilisateur");
        }
    },
    // Unban user
    async unbanUser(req, res, next) {
        try {
            checkAdminAccess(req);
            const { userId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new errors_1.ValidationError("ID utilisateur invalide");
            }
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new errors_1.ValidationError("Utilisateur non trouvé");
            }
            if (!user.isBanned) {
                throw new errors_1.ValidationError("L'utilisateur n'est pas banni");
            }
            user.isBanned = false;
            await user.save();
            // Log de l'événement
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "UNBAN_USER", JSON.stringify({
                    targetUserId: userId,
                    reason: req.body.reason || "Non spécifié",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Utilisateur débanni avec succès",
                data: { userId: user._id, email: user.email },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors du débannissement de l'utilisateur");
        }
    },
    // Get all tools
    async getTools(req, res, next) {
        try {
            checkAdminAccess(req);
            const { page = 1, limit = 20, search, category, status } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            if (pageNum < MIN_PAGE ||
                pageNum > MAX_PAGE ||
                limitNum < MIN_LIMIT ||
                limitNum > MAX_LIMIT) {
                throw new errors_1.ValidationError(`La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`);
            }
            const filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ];
            }
            if (category)
                filter.category = category;
            if (status)
                filter.status = status;
            const [tools, total] = await Promise.all([
                Tool_1.Tool.find(filter)
                    .populate("owner", "firstName lastName email")
                    .populate("category", "name")
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Tool_1.Tool.countDocuments(filter),
            ]);
            const response = {
                message: "Outils récupérés avec succès",
                data: tools,
                metadata: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la récupération des outils");
        }
    },
    // Delete a tool
    async deleteTool(req, res, next) {
        try {
            checkAdminAccess(req);
            const { toolId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(toolId)) {
                throw new errors_1.ValidationError("ID outil invalide");
            }
            const tool = await Tool_1.Tool.findById(toolId);
            if (!tool) {
                throw new errors_1.ValidationError("Outil non trouvé");
            }
            await tool.deleteOne();
            // Log de l'événement
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "DELETE_TOOL", JSON.stringify({
                    toolId,
                    toolName: tool.name,
                    reason: req.body.reason || "Non spécifié",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Outil supprimé avec succès",
                data: { toolId: tool._id, name: tool.name },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la suppression de l'outil");
        }
    },
    // Get all reviews
    async getReviews(req, res, next) {
        try {
            checkAdminAccess(req);
            const { page = 1, limit = 20, rating, toolId, userId } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            if (pageNum < MIN_PAGE ||
                pageNum > MAX_PAGE ||
                limitNum < MIN_LIMIT ||
                limitNum > MAX_LIMIT) {
                throw new errors_1.ValidationError(`La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`);
            }
            const filter = {};
            if (rating)
                filter.rating = Number(rating);
            if (toolId)
                filter.tool = toolId;
            if (userId)
                filter.user = userId;
            const [reviews, total] = await Promise.all([
                Review_1.Review.find(filter)
                    .populate("user", "firstName lastName email")
                    .populate("tool", "name")
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Review_1.Review.countDocuments(filter),
            ]);
            const response = {
                message: "Avis récupérés avec succès",
                data: reviews,
                metadata: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la récupération des avis");
        }
    },
    // Delete a review
    async deleteReview(req, res, next) {
        try {
            checkAdminAccess(req);
            const { reviewId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(reviewId)) {
                throw new errors_1.ValidationError("ID avis invalide");
            }
            const review = await Review_1.Review.findById(reviewId);
            if (!review) {
                throw new errors_1.ValidationError("Avis non trouvé");
            }
            await review.deleteOne();
            // Log de l'événement
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "DELETE_REVIEW", JSON.stringify({
                    reviewId,
                    toolId: review.tool,
                    userId: review.user,
                    reason: req.body.reason || "Non spécifié",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Avis supprimé avec succès",
                data: { reviewId: review._id },
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la suppression de l'avis");
        }
    },
    // Get dashboard stats
    async getStats(req, res, next) {
        try {
            checkAdminAccess(req);
            const [totalUsers, totalTools, totalRentals, totalReviews, activeRentals, totalRevenue, recentActivity,] = await Promise.all([
                User_1.User.countDocuments(),
                Tool_1.Tool.countDocuments(),
                Rental_1.Rental.countDocuments(),
                Review_1.Review.countDocuments(),
                Rental_1.Rental.countDocuments({ status: "active" }),
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
                Rental_1.Rental.find()
                    .populate("tool", "name")
                    .populate("renter", "firstName lastName")
                    .sort({ createdAt: -1 })
                    .limit(5),
            ]);
            const stats = {
                totalUsers,
                totalTools,
                totalRentals,
                totalReviews,
                activeRentals,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentActivity,
            };
            const response = {
                message: "Statistiques récupérées avec succès",
                data: stats,
            };
            res.status(200).json(response);
        }
        catch (error) {
            handleError(error, res, next, "Erreur lors de la récupération des statistiques");
        }
    },
};
//# sourceMappingURL=adminController.js.map