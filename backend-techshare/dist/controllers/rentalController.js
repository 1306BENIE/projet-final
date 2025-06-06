"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalController = void 0;
const models_1 = require("../models");
const stripe_1 = __importDefault(require("stripe"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const securityLogService_1 = require("../services/securityLogService");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}
const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: "2025-04-30.basil" });
const MAX_RENTAL_DAYS = 30;
const MIN_RENTAL_DAYS = 1;
exports.rentalController = {
    async createRental(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { toolId, startDate, endDate } = req.body;
            if (!toolId || !startDate || !endDate) {
                throw new errors_1.ValidationError("Tous les champs sont requis", [
                    { field: "toolId", message: "L'ID de l'outil est requis" },
                    { field: "startDate", message: "La date de début est requise" },
                    { field: "endDate", message: "La date de fin est requise" },
                ]);
            }
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            const now = new Date();
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                throw new errors_1.ValidationError("Format de date invalide");
            }
            if (startDateTime < now) {
                throw new errors_1.ValidationError("La date de début doit être dans le futur");
            }
            if (endDateTime <= startDateTime) {
                throw new errors_1.ValidationError("La date de fin doit être après la date de début");
            }
            const days = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) /
                (1000 * 60 * 60 * 24));
            if (days < MIN_RENTAL_DAYS) {
                throw new errors_1.ValidationError(`La durée minimale de location est de ${MIN_RENTAL_DAYS} jour(s)`);
            }
            if (days > MAX_RENTAL_DAYS) {
                throw new errors_1.ValidationError(`La durée maximale de location est de ${MAX_RENTAL_DAYS} jours`);
            }
            const tool = await models_1.Tool.findById(toolId);
            if (!tool) {
                throw new errors_1.DatabaseError("Outil non trouvé");
            }
            if (tool.status !== "available") {
                throw new errors_1.ValidationError("L'outil n'est pas disponible");
            }
            if (tool.owner.toString() === req.user.userId) {
                throw new errors_1.ValidationError("Vous ne pouvez pas louer votre propre outil");
            }
            const existingRental = await models_1.Rental.findOne({
                tool: toolId,
                status: { $in: ["pending", "approved", "active"] },
                $or: [
                    {
                        startDate: { $lte: endDateTime },
                        endDate: { $gte: startDateTime },
                    },
                ],
            });
            if (existingRental) {
                throw new errors_1.ValidationError("L'outil est déjà réservé pour ces dates");
            }
            const totalPrice = days * tool.dailyPrice;
            if (totalPrice <= 0) {
                throw new errors_1.ValidationError("Le prix total calculé est invalide");
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round((totalPrice + tool.deposit) * 100),
                currency: "usd",
                metadata: {
                    toolId,
                    startDate,
                    endDate,
                    userId: req.user.userId,
                },
            });
            const rental = new models_1.Rental({
                tool: new mongoose_1.Types.ObjectId(toolId),
                renter: new mongoose_1.Types.ObjectId(req.user.userId),
                owner: tool.owner,
                startDate: startDateTime,
                endDate: endDateTime,
                totalPrice,
                deposit: tool.deposit,
                paymentIntentId: paymentIntent.id,
                status: "pending",
                paymentStatus: "pending",
            });
            await rental.save();
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "rental_created", "Nouvelle demande de location créée");
            const response = {
                message: "Demande de location créée avec succès",
                rental,
                ...(paymentIntent.client_secret
                    ? { clientSecret: paymentIntent.client_secret }
                    : {}),
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getUserRentals(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const rentals = await models_1.Rental.find({ renter: req.user.userId })
                .populate("tool")
                .populate("owner", "firstName lastName email")
                .sort({ createdAt: -1 });
            const response = {
                message: "Locations récupérées avec succès",
                rentals: rentals || [],
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async getOwnerRentals(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const tools = await models_1.Tool.find({ owner: req.user.userId });
            const toolIds = tools.map((tool) => tool._id);
            const rentals = await models_1.Rental.find({ tool: { $in: toolIds } })
                .populate("tool")
                .populate("renter", "firstName lastName email")
                .sort({ createdAt: -1 });
            const response = {
                message: "Locations récupérées avec succès",
                rentals: rentals || [],
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async updateRentalStatus(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { rentalId, status } = req.body;
            if (!rentalId || !status) {
                throw new errors_1.ValidationError("ID de location et statut requis");
            }
            if (!["approved", "rejected", "cancelled"].includes(status)) {
                throw new errors_1.ValidationError("Statut invalide");
            }
            const rental = await models_1.Rental.findById(rentalId).populate("tool");
            if (!rental) {
                throw new errors_1.DatabaseError("Location non trouvée");
            }
            if (rental.owner.toString() !== req.user.userId) {
                throw new errors_1.AuthenticationError("Non autorisé à modifier cette location");
            }
            if (rental.status !== "pending") {
                throw new errors_1.ValidationError("Seules les locations en attente peuvent être modifiées");
            }
            rental.status = status;
            if (status === "rejected" || status === "cancelled") {
                rental.paymentStatus = "refunded";
            }
            await rental.save();
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "rental_status_updated", `Statut de location mis à jour: ${status}`);
            const response = {
                message: "Statut de location mis à jour avec succès",
                rental,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async addReview(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            const { rentalId, rating, comment } = req.body;
            if (!rentalId || !rating || !comment) {
                throw new errors_1.ValidationError("Tous les champs sont requis");
            }
            if (rating < 1 || rating > 5) {
                throw new errors_1.ValidationError("La note doit être entre 1 et 5");
            }
            const rental = await models_1.Rental.findById(rentalId);
            if (!rental) {
                throw new errors_1.DatabaseError("Location non trouvée");
            }
            if (rental.renter.toString() !== req.user.userId) {
                throw new errors_1.AuthenticationError("Seul le locataire peut ajouter un avis");
            }
            if (rental.status !== "completed") {
                throw new errors_1.ValidationError("Vous ne pouvez pas ajouter un avis pour une location non terminée");
            }
            if (rental.review) {
                throw new errors_1.ValidationError("Un avis existe déjà pour cette location");
            }
            rental.review = {
                rating,
                comment,
                date: new Date(),
            };
            await rental.save();
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "review_added", "Avis ajouté à la location");
            const response = {
                message: "Avis ajouté avec succès",
                rental,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=rentalController.js.map