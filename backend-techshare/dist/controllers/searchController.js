"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const Tool_1 = require("../models/Tool");
const Category_1 = require("../models/Category");
const errors_1 = require("../utils/errors");
// Constantes de validation
const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MIN_RADIUS = 1;
const MAX_RADIUS = 100;
const MIN_PAGE = 1;
const MAX_PAGE = 100;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;
const VALID_SORT_FIELDS = ["createdAt", "price", "rating", "name"];
const VALID_SORT_ORDERS = ["asc", "desc"];
exports.searchController = {
    // Search tools with filters
    async searchTools(req, res, next) {
        try {
            const { query, category, minPrice, maxPrice, location, radius, availability, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10, } = req.query;
            // Validation des paramètres de pagination
            const pageNum = Number(page);
            const limitNum = Number(limit);
            if (pageNum < MIN_PAGE ||
                pageNum > MAX_PAGE ||
                limitNum < MIN_LIMIT ||
                limitNum > MAX_LIMIT) {
                throw new errors_1.ValidationError(`La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`);
            }
            // Validation du tri
            if (!VALID_SORT_FIELDS.includes(sortBy)) {
                throw new errors_1.ValidationError("Champ de tri invalide");
            }
            if (!VALID_SORT_ORDERS.includes(sortOrder)) {
                throw new errors_1.ValidationError("Ordre de tri invalide");
            }
            // Construction de la requête de base
            const filter = {};
            // Recherche textuelle
            if (query) {
                if (query.length < 2) {
                    throw new errors_1.ValidationError("La recherche doit contenir au moins 2 caractères");
                }
                filter.$or = [
                    { name: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ];
            }
            // Filtre par catégorie
            if (category) {
                const categoryDoc = await Category_1.Category.findOne({
                    name: { $regex: new RegExp(`^${category}$`, "i") },
                });
                if (!categoryDoc) {
                    throw new errors_1.ValidationError("Catégorie non trouvée");
                }
                filter.category = categoryDoc._id;
            }
            // Filtre par prix
            if (minPrice || maxPrice) {
                filter.dailyPrice = {};
                if (minPrice) {
                    const minPriceNum = Number(minPrice);
                    if (minPriceNum < MIN_PRICE) {
                        throw new errors_1.ValidationError(`Le prix minimum doit être supérieur à ${MIN_PRICE}`);
                    }
                    filter.dailyPrice.$gte = minPriceNum;
                }
                if (maxPrice) {
                    const maxPriceNum = Number(maxPrice);
                    if (maxPriceNum > MAX_PRICE) {
                        throw new errors_1.ValidationError(`Le prix maximum doit être inférieur à ${MAX_PRICE}`);
                    }
                    filter.dailyPrice.$lte = maxPriceNum;
                }
            }
            // Filtre par disponibilité
            if (availability === true) {
                filter.status = "available";
            }
            // Filtre géospatial
            if (location && radius) {
                const [longitude, latitude] = location.split(",").map(Number);
                if (isNaN(longitude) ||
                    isNaN(latitude) ||
                    longitude < -180 ||
                    longitude > 180 ||
                    latitude < -90 ||
                    latitude > 90) {
                    throw new errors_1.ValidationError("Coordonnées géographiques invalides");
                }
                const radiusNum = Number(radius);
                if (radiusNum < MIN_RADIUS || radiusNum > MAX_RADIUS) {
                    throw new errors_1.ValidationError(`Le rayon doit être compris entre ${MIN_RADIUS} et ${MAX_RADIUS} kilomètres`);
                }
                filter.location = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: radiusNum * 1000, // Conversion en mètres
                    },
                };
            }
            // Calcul de la pagination
            const skip = (pageNum - 1) * limitNum;
            // Exécution de la requête
            const [tools, total] = await Promise.all([
                Tool_1.Tool.find(filter)
                    .populate("owner", "firstName lastName rating")
                    .populate("category", "name")
                    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
                    .skip(skip)
                    .limit(limitNum),
                Tool_1.Tool.countDocuments(filter),
            ]);
            const response = {
                message: "Recherche effectuée avec succès",
                tools,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Get popular tools
    async getPopularTools(_req, res, next) {
        try {
            const tools = await Tool_1.Tool.find({ status: "available" })
                .populate("owner", "firstName lastName rating")
                .populate("category", "name")
                .sort({ rating: -1, rentalCount: -1 })
                .limit(10);
            const response = {
                message: "Outils populaires récupérés avec succès",
                tools,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Get nearby tools
    async getNearbyTools(req, res, next) {
        try {
            const { longitude, latitude, radius = 10 } = req.query;
            if (!longitude || !latitude) {
                throw new errors_1.ValidationError("Coordonnées requises");
            }
            const longitudeNum = Number(longitude);
            const latitudeNum = Number(latitude);
            const radiusNum = Number(radius);
            if (isNaN(longitudeNum) ||
                isNaN(latitudeNum) ||
                longitudeNum < -180 ||
                longitudeNum > 180 ||
                latitudeNum < -90 ||
                latitudeNum > 90) {
                throw new errors_1.ValidationError("Coordonnées géographiques invalides");
            }
            if (radiusNum < MIN_RADIUS || radiusNum > MAX_RADIUS) {
                throw new errors_1.ValidationError(`Le rayon doit être compris entre ${MIN_RADIUS} et ${MAX_RADIUS} kilomètres`);
            }
            const tools = await Tool_1.Tool.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitudeNum, latitudeNum],
                        },
                        $maxDistance: radiusNum * 1000, // Conversion en mètres
                    },
                },
                status: "available",
            })
                .populate("owner", "firstName lastName rating")
                .populate("category", "name")
                .limit(20);
            const response = {
                message: "Outils à proximité récupérés avec succès",
                tools,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=searchController.js.map