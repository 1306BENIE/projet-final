"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
exports.reviewController = {
    async createReview(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Utilisateur non authentifié");
            }
            const { toolId, rentalId, rating, comment } = req.body;
            if (!toolId || !rentalId || !rating || !comment) {
                throw new errors_1.ValidationError("Tous les champs sont requis", [
                    { field: "toolId", message: "L'ID de l'outil est requis" },
                    { field: "rentalId", message: "L'ID de la location est requis" },
                    { field: "rating", message: "La note est requise" },
                    { field: "comment", message: "Le commentaire est requis" },
                ]);
            }
            if (rating < 1 || rating > 5) {
                throw new errors_1.ValidationError("La note doit être comprise entre 1 et 5");
            }
            const rental = await models_1.Rental.findOne({
                _id: new mongoose_1.Types.ObjectId(rentalId),
                renter: new mongoose_1.Types.ObjectId(req.user.userId),
                status: "completed",
            });
            if (!rental) {
                throw new errors_1.ValidationError("Location non trouvée ou non terminée");
            }
            const existingReview = await models_1.Review.findOne({
                user: new mongoose_1.Types.ObjectId(req.user.userId),
                rental: new mongoose_1.Types.ObjectId(rentalId),
            });
            if (existingReview) {
                throw new errors_1.ValidationError("Vous avez déjà laissé un avis pour cette location");
            }
            const review = new models_1.Review({
                user: new mongoose_1.Types.ObjectId(req.user.userId),
                tool: new mongoose_1.Types.ObjectId(toolId),
                rental: new mongoose_1.Types.ObjectId(rentalId),
                rating,
                comment,
            });
            await review.save();
            const response = {
                message: "Avis créé avec succès",
                review,
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getReviewsByTool(req, res, next) {
        try {
            const { toolId } = req.params;
            if (!toolId) {
                throw new errors_1.ValidationError("L'ID de l'outil est requis");
            }
            const reviews = await models_1.Review.find({ tool: new mongoose_1.Types.ObjectId(toolId) })
                .populate("user", "firstName lastName rating")
                .populate("tool", "name category")
                .sort({ createdAt: -1 });
            const response = {
                message: reviews.length
                    ? "Avis récupérés avec succès"
                    : "Aucun avis trouvé",
                reviews,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getReviewsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw new errors_1.ValidationError("L'ID de l'utilisateur est requis");
            }
            const reviews = await models_1.Review.find({ user: new mongoose_1.Types.ObjectId(userId) })
                .populate("tool", "name category price")
                .populate("rental", "startDate endDate")
                .sort({ createdAt: -1 });
            const response = {
                message: reviews.length
                    ? "Avis récupérés avec succès"
                    : "Aucun avis trouvé",
                reviews,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async updateReview(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Utilisateur non authentifié");
            }
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            if (!reviewId) {
                throw new errors_1.ValidationError("L'ID de l'avis est requis");
            }
            if (!rating || !comment) {
                throw new errors_1.ValidationError("La note et le commentaire sont requis");
            }
            if (rating < 1 || rating > 5) {
                throw new errors_1.ValidationError("La note doit être comprise entre 1 et 5");
            }
            const review = await models_1.Review.findOne({
                _id: new mongoose_1.Types.ObjectId(reviewId),
                user: new mongoose_1.Types.ObjectId(req.user.userId),
            });
            if (!review) {
                throw new errors_1.DatabaseError("Avis non trouvé");
            }
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (review.createdAt < thirtyDaysAgo) {
                throw new errors_1.ValidationError("Vous ne pouvez plus modifier cet avis après 30 jours");
            }
            review.rating = rating;
            review.comment = comment;
            await review.save();
            const response = {
                message: "Avis mis à jour avec succès",
                review,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async deleteReview(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Utilisateur non authentifié");
            }
            const { reviewId } = req.params;
            if (!reviewId) {
                throw new errors_1.ValidationError("L'ID de l'avis est requis");
            }
            const review = await models_1.Review.findOne({
                _id: new mongoose_1.Types.ObjectId(reviewId),
                user: new mongoose_1.Types.ObjectId(req.user.userId),
            });
            if (!review) {
                throw new errors_1.DatabaseError("Avis non trouvé");
            }
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (review.createdAt < thirtyDaysAgo) {
                throw new errors_1.ValidationError("Vous ne pouvez plus supprimer cet avis après 30 jours");
            }
            await review.deleteOne();
            const response = {
                message: "Avis supprimé avec succès",
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=reviewController.js.map