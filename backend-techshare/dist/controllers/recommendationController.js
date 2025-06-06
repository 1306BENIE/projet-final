"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationController = void 0;
const mongoose_1 = require("mongoose");
const recommendationService_1 = require("../services/recommendationService");
const errors_1 = require("../utils/errors");
const securityLogService_1 = require("../services/securityLogService");
// Constantes de validation
const MIN_RECOMMENDATIONS = 1;
const MAX_RECOMMENDATIONS = 50;
const MIN_SIMILAR_TOOLS = 1;
const MAX_SIMILAR_TOOLS = 20;
const VALID_TIME_RANGES = ["day", "week", "month", "year"];
exports.recommendationController = {
    async getPersonalizedRecommendations(req, res, next) {
        try {
            const recommendationService = (0, recommendationService_1.getRecommendationService)();
            const userId = req.user?.userId;
            if (!userId) {
                throw new errors_1.ValidationError("Authentification requise");
            }
            // Validation du paramètre limit
            const limit = Number(req.query.limit) || 10;
            if (limit < MIN_RECOMMENDATIONS || limit > MAX_RECOMMENDATIONS) {
                throw new errors_1.ValidationError(`Le nombre de recommandations doit être compris entre ${MIN_RECOMMENDATIONS} et ${MAX_RECOMMENDATIONS}`);
            }
            // Conversion de l'ID en ObjectId
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            // Récupération des recommandations
            const recommendations = await recommendationService.getPersonalizedRecommendations(userObjectId.toString(), limit);
            // Log de l'événement
            await securityLogService_1.securityLogService.logEvent(userObjectId, "GET_PERSONALIZED_RECOMMENDATIONS", JSON.stringify({
                limit,
                recommendationsCount: recommendations.length,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            }));
            const response = {
                message: "Recommandations personnalisées récupérées avec succès",
                recommendations,
                metadata: {
                    total: recommendations.length,
                    limit,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getSimilarTools(req, res, next) {
        try {
            const recommendationService = (0, recommendationService_1.getRecommendationService)();
            const { toolId } = req.params;
            if (!toolId || !mongoose_1.Types.ObjectId.isValid(toolId)) {
                throw new errors_1.ValidationError("ID d'outil invalide");
            }
            // Validation du paramètre limit
            const limit = Number(req.query.limit) || 5;
            if (limit < MIN_SIMILAR_TOOLS || limit > MAX_SIMILAR_TOOLS) {
                throw new errors_1.ValidationError(`Le nombre d'outils similaires doit être compris entre ${MIN_SIMILAR_TOOLS} et ${MAX_SIMILAR_TOOLS}`);
            }
            // Conversion de l'ID en ObjectId
            const toolObjectId = new mongoose_1.Types.ObjectId(toolId);
            // Récupération des outils similaires
            const similarTools = await recommendationService.getSimilarTools(toolObjectId.toString(), limit);
            // Log de l'événement si l'utilisateur est authentifié
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "GET_SIMILAR_TOOLS", JSON.stringify({
                    toolId: toolObjectId,
                    limit,
                    similarToolsCount: similarTools.length,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Outils similaires récupérés avec succès",
                tools: similarTools,
                metadata: {
                    total: similarTools.length,
                    limit,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getPopularTools(req, res, next) {
        try {
            const recommendationService = (0, recommendationService_1.getRecommendationService)();
            // Validation des paramètres de pagination
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const category = req.query.category;
            const timeRange = req.query.timeRange || "month";
            // Validation du timeRange
            if (!VALID_TIME_RANGES.includes(timeRange)) {
                throw new errors_1.ValidationError(`La période doit être l'une des suivantes : ${VALID_TIME_RANGES.join(", ")}`);
            }
            // Récupération des outils populaires
            const { tools, total } = await recommendationService.getPopularTools({
                page,
                limit,
                category,
                timeRange,
            });
            // Calcul du nombre total de pages
            const pages = Math.ceil(total / limit);
            // Log de l'événement si l'utilisateur est authentifié
            if (req.user?.userId) {
                await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "GET_POPULAR_TOOLS", JSON.stringify({
                    page,
                    limit,
                    category,
                    timeRange,
                    toolsCount: tools.length,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                }));
            }
            const response = {
                message: "Outils populaires récupérés avec succès",
                tools,
                metadata: {
                    total,
                    page,
                    limit,
                    pages,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=recommendationController.js.map