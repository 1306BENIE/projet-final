"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsController = void 0;
const Tool_1 = require("../models/Tool");
const Rental_1 = require("../models/Rental");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
const Category_1 = require("../models/Category");
const logger_1 = require("../utils/logger");
const handleError = (res, error, message) => {
    logger_1.logger.error(message, error);
    res.status(500).json({ message });
};
exports.statsController = {
    async getDashboardStats(_req, res) {
        try {
            const [totalTools, totalUsers, totalRentals, totalReviews, activeRentals, totalRevenue,] = await Promise.all([
                Tool_1.Tool.countDocuments(),
                User_1.User.countDocuments(),
                Rental_1.Rental.countDocuments(),
                Review_1.Review.countDocuments(),
                Rental_1.Rental.countDocuments({ status: "active" }),
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed", paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
            ]);
            const revenue = totalRevenue[0]?.total || 0;
            res.json({
                totalTools,
                totalUsers,
                totalRentals,
                totalReviews,
                activeRentals,
                totalRevenue: revenue,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques du tableau de bord");
        }
    },
    async getToolStats(_req, res) {
        try {
            const [popularTools, topRatedTools, categoryDistribution] = await Promise.all([
                Tool_1.Tool.find()
                    .sort({ rentalCount: -1 })
                    .limit(5)
                    .select("name rentalCount rating"),
                Tool_1.Tool.find()
                    .sort({ rating: -1 })
                    .limit(5)
                    .select("name rating rentalCount"),
                Tool_1.Tool.aggregate([
                    { $group: { _id: "$category", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
            ]);
            res.json({
                popularTools,
                topRatedTools,
                categoryDistribution,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques des outils");
        }
    },
    async getUserStats(_req, res) {
        try {
            const [userGrowth, activeUsers, topRenters] = await Promise.all([
                User_1.User.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                ]),
                User_1.User.countDocuments({ isActive: true }),
                User_1.User.aggregate([
                    { $match: { role: "user" } },
                    {
                        $lookup: {
                            from: "rentals",
                            localField: "_id",
                            foreignField: "renter",
                            as: "rentals",
                        },
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            rentalCount: { $size: "$rentals" },
                        },
                    },
                    { $sort: { rentalCount: -1 } },
                    { $limit: 5 },
                ]),
            ]);
            res.json({
                userGrowth,
                activeUsers,
                topRenters,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques des utilisateurs");
        }
    },
    async getRentalStats(_req, res) {
        try {
            const [rentalTrends, statusDistribution, averageRentalDuration] = await Promise.all([
                Rental_1.Rental.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                            },
                            count: { $sum: 1 },
                            revenue: { $sum: "$totalPrice" },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                ]),
                Rental_1.Rental.aggregate([
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ]),
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed" } },
                    {
                        $group: {
                            _id: null,
                            averageDuration: {
                                $avg: {
                                    $divide: [
                                        { $subtract: ["$endDate", "$startDate"] },
                                        1000 * 60 * 60 * 24, // Convertir en jours
                                    ],
                                },
                            },
                        },
                    },
                ]),
            ]);
            res.json({
                rentalTrends,
                statusDistribution,
                averageRentalDuration: averageRentalDuration[0]?.averageDuration || 0,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques des locations");
        }
    },
    async getRevenueStats(_req, res) {
        try {
            const [monthlyRevenue, categoryRevenue, paymentMethodDistribution] = await Promise.all([
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed", paymentStatus: "paid" } },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                            },
                            revenue: { $sum: "$totalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                ]),
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed", paymentStatus: "paid" } },
                    {
                        $lookup: {
                            from: "tools",
                            localField: "tool",
                            foreignField: "_id",
                            as: "tool",
                        },
                    },
                    { $unwind: "$tool" },
                    {
                        $group: {
                            _id: "$tool.category",
                            revenue: { $sum: "$totalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { revenue: -1 } },
                ]),
                Rental_1.Rental.aggregate([
                    { $match: { status: "completed", paymentStatus: "paid" } },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            revenue: { $sum: "$totalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                ]),
            ]);
            res.json({
                monthlyRevenue,
                categoryRevenue,
                paymentMethodDistribution,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques de revenus");
        }
    },
    async getCategoryStats(_req, res) {
        try {
            const [categoryDistribution, categoryPerformance, categoryTrends] = await Promise.all([
                Category_1.Category.aggregate([
                    {
                        $lookup: {
                            from: "tools",
                            localField: "_id",
                            foreignField: "category",
                            as: "tools",
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            toolCount: { $size: "$tools" },
                            averageRating: { $avg: "$tools.rating" },
                            totalRentals: { $sum: "$tools.rentalCount" },
                        },
                    },
                    { $sort: { toolCount: -1 } },
                ]),
                Category_1.Category.aggregate([
                    {
                        $lookup: {
                            from: "tools",
                            localField: "_id",
                            foreignField: "category",
                            as: "tools",
                        },
                    },
                    {
                        $lookup: {
                            from: "rentals",
                            localField: "tools._id",
                            foreignField: "tool",
                            as: "rentals",
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            revenue: { $sum: "$rentals.totalPrice" },
                            rentalCount: { $size: "$rentals" },
                            averageRating: { $avg: "$tools.rating" },
                        },
                    },
                    { $sort: { revenue: -1 } },
                ]),
                Category_1.Category.aggregate([
                    {
                        $lookup: {
                            from: "tools",
                            localField: "_id",
                            foreignField: "category",
                            as: "tools",
                        },
                    },
                    {
                        $lookup: {
                            from: "rentals",
                            localField: "tools._id",
                            foreignField: "tool",
                            as: "rentals",
                        },
                    },
                    {
                        $group: {
                            _id: {
                                category: "$name",
                                year: { $year: "$rentals.createdAt" },
                                month: { $month: "$rentals.createdAt" },
                            },
                            rentalCount: { $sum: 1 },
                            revenue: { $sum: "$rentals.totalPrice" },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                ]),
            ]);
            res.json({
                categoryDistribution,
                categoryPerformance,
                categoryTrends,
            });
        }
        catch (error) {
            handleError(res, error, "Erreur lors de la récupération des statistiques des catégories");
        }
    },
};
//# sourceMappingURL=statsController.js.map