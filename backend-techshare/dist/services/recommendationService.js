"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendationService = exports.initializeRecommendationService = void 0;
const Tool_1 = require("../models/Tool");
const Rental_1 = require("../models/Rental");
const Review_1 = require("../models/Review");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class RecommendationService {
    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            if (!userId) {
                throw new errors_1.ValidationError("ID utilisateur requis");
            }
            if (limit < 1 || limit > 50) {
                throw new errors_1.ValidationError("La limite doit être comprise entre 1 et 50");
            }
            const userHistory = await this.getUserHistory(userId);
            if (userHistory.rentals.length === 0 &&
                userHistory.reviews.length === 0) {
                const result = await this.getPopularTools({
                    page: 1,
                    limit,
                    timeRange: "month",
                });
                return result.tools;
            }
            const preferences = await this.analyzeUserPreferences(userHistory);
            return this.generateRecommendations(userId, preferences, limit);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la génération des recommandations:", error);
            throw error instanceof errors_1.ValidationError
                ? error
                : new errors_1.DatabaseError("Erreur lors de la génération des recommandations");
        }
    }
    async getUserHistory(userId) {
        try {
            const [rentals, reviews] = await Promise.all([
                Rental_1.Rental.find({ renter: new mongoose_1.Types.ObjectId(userId) })
                    .populate("tool")
                    .sort({ createdAt: -1 })
                    .limit(50),
                Review_1.Review.find({ user: new mongoose_1.Types.ObjectId(userId) })
                    .populate("tool")
                    .sort({ createdAt: -1 })
                    .limit(50),
            ]);
            return { rentals, reviews };
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération de l'historique utilisateur:", error);
            throw new errors_1.DatabaseError("Erreur lors de la récupération de l'historique utilisateur");
        }
    }
    async analyzeUserPreferences(history) {
        try {
            const preferences = {
                categories: new Map(),
                priceRange: { min: Infinity, max: 0 },
                locations: new Set(),
            };
            for (const rental of history.rentals) {
                const tool = rental.tool;
                if (tool) {
                    const categoryCount = preferences.categories.get(tool.category.toString()) || 0;
                    preferences.categories.set(tool.category.toString(), categoryCount + 1);
                    preferences.priceRange.min = Math.min(preferences.priceRange.min, tool.price);
                    preferences.priceRange.max = Math.max(preferences.priceRange.max, tool.price);
                    if (tool.location) {
                        preferences.locations.add(tool.location.coordinates.join(","));
                    }
                }
            }
            for (const review of history.reviews) {
                const tool = review.tool;
                if (tool && review.rating >= 4) {
                    const categoryCount = preferences.categories.get(tool.category.toString()) || 0;
                    preferences.categories.set(tool.category.toString(), categoryCount + 2);
                }
            }
            return preferences;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'analyse des préférences utilisateur:", error);
            throw new errors_1.DatabaseError("Erreur lors de l'analyse des préférences utilisateur");
        }
    }
    async generateRecommendations(userId, preferences, limit) {
        try {
            const categoryIds = Array.from(preferences.categories.keys());
            const priceRange = preferences.priceRange;
            const query = {
                owner: { $ne: new mongoose_1.Types.ObjectId(userId) },
                isAvailable: true,
            };
            if (categoryIds.length > 0) {
                query.category = { $in: categoryIds };
            }
            if (priceRange.min !== Infinity && priceRange.max !== 0) {
                query.price = {
                    $gte: priceRange.min * 0.8,
                    $lte: priceRange.max * 1.2,
                };
            }
            const tools = await Tool_1.Tool.find(query)
                .populate("owner", "firstName lastName rating")
                .populate("category", "name")
                .sort({ rating: -1, rentalCount: -1 })
                .limit(limit * 2);
            const scoredTools = tools.map((tool) => {
                let score = 0;
                const categoryWeight = preferences.categories.get(tool.category.toString()) || 0;
                score += categoryWeight * 2;
                const priceScore = 1 -
                    Math.abs(tool.price - (priceRange.min + priceRange.max) / 2) /
                        priceRange.max;
                score += priceScore * 1.5;
                score += tool.rating * 2;
                score += Math.log(tool.rentalCount + 1);
                return { tool, score };
            });
            return scoredTools
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map((item) => item.tool);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la génération des recommandations:", error);
            throw new errors_1.DatabaseError("Erreur lors de la génération des recommandations");
        }
    }
    async getPopularTools(options) {
        try {
            const { page, limit, category, timeRange } = options;
            const startDate = new Date();
            switch (timeRange) {
                case "day":
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case "week":
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case "month":
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case "year":
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setMonth(startDate.getMonth() - 1);
            }
            const query = {
                isAvailable: true,
                createdAt: { $gte: startDate },
            };
            if (category) {
                query.category = new mongoose_1.Types.ObjectId(category);
            }
            const total = await Tool_1.Tool.countDocuments(query);
            const tools = await Tool_1.Tool.find(query)
                .populate("owner", "firstName lastName rating")
                .populate("category", "name")
                .sort({ rating: -1, rentalCount: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            return { tools, total };
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la récupération des outils populaires:", error);
            throw new errors_1.DatabaseError("Erreur lors de la récupération des outils populaires");
        }
    }
    async getSimilarTools(toolId, limit = 5) {
        try {
            if (!toolId) {
                throw new errors_1.ValidationError("ID de l'outil requis");
            }
            if (limit < 1 || limit > 20) {
                throw new errors_1.ValidationError("La limite doit être comprise entre 1 et 20");
            }
            const tool = await Tool_1.Tool.findById(toolId);
            if (!tool) {
                throw new errors_1.ValidationError("Outil non trouvé");
            }
            return await Tool_1.Tool.find({
                _id: { $ne: new mongoose_1.Types.ObjectId(toolId) },
                category: tool.category,
                isAvailable: true,
            })
                .populate("owner", "firstName lastName rating")
                .populate("category", "name")
                .sort({ rating: -1, rentalCount: -1 })
                .limit(limit);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la recherche d'outils similaires:", error);
            throw error instanceof errors_1.ValidationError
                ? error
                : new errors_1.DatabaseError("Erreur lors de la recherche d'outils similaires");
        }
    }
}
let recommendationService;
const initializeRecommendationService = () => {
    recommendationService = new RecommendationService();
    return recommendationService;
};
exports.initializeRecommendationService = initializeRecommendationService;
const getRecommendationService = () => {
    if (!recommendationService) {
        throw new errors_1.DatabaseError("RecommendationService n'a pas été initialisé");
    }
    return recommendationService;
};
exports.getRecommendationService = getRecommendationService;
//# sourceMappingURL=recommendationService.js.map