"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = void 0;
const Tool_1 = require("../models/Tool");
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
class SearchService {
    async searchTools(filters, page = 1, limit = 10) {
        try {
            const query = {};
            // Filtre par catégorie
            if (filters.category) {
                query.category = new mongoose_1.Types.ObjectId(filters.category);
            }
            // Filtre par prix
            if (filters.minPrice || filters.maxPrice) {
                query.price = {};
                if (filters.minPrice)
                    query.price.$gte = filters.minPrice;
                if (filters.maxPrice)
                    query.price.$lte = filters.maxPrice;
            }
            // Filtre par localisation
            if (filters.location && filters.maxDistance) {
                query.location = {
                    $near: {
                        $geometry: filters.location,
                        $maxDistance: filters.maxDistance * 1000, // Conversion en mètres
                    },
                };
            }
            // Filtre par disponibilité
            if (filters.availability) {
                query.availability = {
                    $elemMatch: {
                        startDate: { $lte: filters.availability.endDate },
                        endDate: { $gte: filters.availability.startDate },
                    },
                };
            }
            // Recherche textuelle
            if (filters.searchTerm) {
                query.$or = [
                    { name: { $regex: filters.searchTerm, $options: "i" } },
                    { description: { $regex: filters.searchTerm, $options: "i" } },
                ];
            }
            const skip = (page - 1) * limit;
            const [tools, total] = await Promise.all([
                Tool_1.Tool.find(query)
                    .populate("category", "name")
                    .populate("owner", "name email")
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Tool_1.Tool.countDocuments(query),
            ]);
            return {
                tools,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la recherche d'outils:", error);
            throw new Error(`Erreur lors de la recherche: ${error.message}`);
        }
    }
}
exports.searchService = new SearchService();
//# sourceMappingURL=searchService.js.map