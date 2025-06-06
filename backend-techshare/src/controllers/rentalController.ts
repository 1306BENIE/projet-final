import { Request, Response, NextFunction } from "express";
import { Rental, Tool } from "../models";
import Stripe from "stripe";
import {
  ValidationError,
  DatabaseError,
  AuthenticationError,
} from "../utils/errors";
import { Types } from "mongoose";
import { IRental } from "../interfaces/rental.interface";
import { securityLogService } from "../services/securityLogService";

// Vérification de la clé secrète Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-04-30.basil" });

// Interface pour les données de location
interface RentalData {
  toolId: string;
  startDate: string;
  endDate: string;
}

// Interface pour les données de révision
interface ReviewData {
  rentalId: string;
  rating: number;
  comment: string;
}

// Interface pour les réponses d'API
interface RentalResponse {
  message: string;
  rental?: IRental;
  rentals?: IRental[];
  clientSecret?: string;
}

// Constantes de validation
const MAX_RENTAL_DAYS = 30;
const MIN_RENTAL_DAYS = 1;

export const rentalController = {
  // Create a new rental request
  async createRental(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { toolId, startDate, endDate } = req.body as RentalData;

      // Validation des champs requis
      if (!toolId || !startDate || !endDate) {
        throw new ValidationError("Tous les champs sont requis", [
          { field: "toolId", message: "L'ID de l'outil est requis" },
          { field: "startDate", message: "La date de début est requise" },
          { field: "endDate", message: "La date de fin est requise" },
        ]);
      }

      // Validation des dates
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      const now = new Date();

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new ValidationError("Format de date invalide");
      }

      if (startDateTime < now) {
        throw new ValidationError("La date de début doit être dans le futur");
      }

      if (endDateTime <= startDateTime) {
        throw new ValidationError(
          "La date de fin doit être après la date de début"
        );
      }

      // Validation de la durée de location
      const days = Math.ceil(
        (endDateTime.getTime() - startDateTime.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (days < MIN_RENTAL_DAYS) {
        throw new ValidationError(
          `La durée minimale de location est de ${MIN_RENTAL_DAYS} jour(s)`
        );
      }

      if (days > MAX_RENTAL_DAYS) {
        throw new ValidationError(
          `La durée maximale de location est de ${MAX_RENTAL_DAYS} jours`
        );
      }

      // Check if tool exists and is available
      const tool = await Tool.findById(toolId);
      if (!tool) {
        throw new DatabaseError("Outil non trouvé");
      }

      if (tool.status !== "available") {
        throw new ValidationError("L'outil n'est pas disponible");
      }

      // Vérifier si l'utilisateur n'est pas le propriétaire
      if (tool.owner.toString() === req.user.userId) {
        throw new ValidationError(
          "Vous ne pouvez pas louer votre propre outil"
        );
      }

      // Vérifier si l'outil est déjà réservé pour ces dates
      const existingRental = await Rental.findOne({
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
        throw new ValidationError("L'outil est déjà réservé pour ces dates");
      }

      // Calculate total price
      const totalPrice = days * tool.dailyPrice;

      if (totalPrice <= 0) {
        throw new ValidationError("Le prix total calculé est invalide");
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((totalPrice + tool.deposit) * 100), // Convert to cents and ensure integer
        currency: "usd",
        metadata: {
          toolId,
          startDate,
          endDate,
          userId: req.user.userId,
        },
      });

      // Create rental
      const rental = new Rental({
        tool: new Types.ObjectId(toolId),
        renter: new Types.ObjectId(req.user.userId),
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

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "rental_created",
        "Nouvelle demande de location créée"
      );

      const response: RentalResponse = {
        message: "Demande de location créée avec succès",
        rental,
        ...(paymentIntent.client_secret
          ? { clientSecret: paymentIntent.client_secret }
          : {}),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Get all rentals for a user
  async getUserRentals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const rentals = await Rental.find({ renter: req.user.userId })
        .populate("tool")
        .populate("owner", "firstName lastName email")
        .sort({ createdAt: -1 });

      const response: RentalResponse = {
        message: "Locations récupérées avec succès",
        rentals: rentals || [],
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Get all rentals for tools owned by user
  async getOwnerRentals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const tools = await Tool.find({ owner: req.user.userId });
      const toolIds = tools.map((tool) => tool._id);

      const rentals = await Rental.find({ tool: { $in: toolIds } })
        .populate("tool")
        .populate("renter", "firstName lastName email")
        .sort({ createdAt: -1 });

      const response: RentalResponse = {
        message: "Locations récupérées avec succès",
        rentals: rentals || [],
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Update rental status
  async updateRentalStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { rentalId, status } = req.body;

      if (!rentalId || !status) {
        throw new ValidationError("ID de location et statut requis");
      }

      if (!["approved", "rejected", "cancelled"].includes(status)) {
        throw new ValidationError("Statut invalide");
      }

      const rental = await Rental.findById(rentalId).populate("tool");

      if (!rental) {
        throw new DatabaseError("Location non trouvée");
      }

      // Vérifier si l'utilisateur est le propriétaire de l'outil
      if (rental.owner.toString() !== req.user.userId) {
        throw new AuthenticationError("Non autorisé à modifier cette location");
      }

      // Vérifier si la location peut être modifiée
      if (rental.status !== "pending") {
        throw new ValidationError(
          "Seules les locations en attente peuvent être modifiées"
        );
      }

      // Mettre à jour le statut
      rental.status = status;
      if (status === "rejected" || status === "cancelled") {
        rental.paymentStatus = "refunded";
      }

      await rental.save();

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "rental_status_updated",
        `Statut de location mis à jour: ${status}`
      );

      const response: RentalResponse = {
        message: "Statut de location mis à jour avec succès",
        rental,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Add review to rental
  async addReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { rentalId, rating, comment } = req.body as ReviewData;

      if (!rentalId || !rating || !comment) {
        throw new ValidationError("Tous les champs sont requis");
      }

      if (rating < 1 || rating > 5) {
        throw new ValidationError("La note doit être entre 1 et 5");
      }

      const rental = await Rental.findById(rentalId);

      if (!rental) {
        throw new DatabaseError("Location non trouvée");
      }

      // Vérifier si l'utilisateur est le locataire
      if (rental.renter.toString() !== req.user.userId) {
        throw new AuthenticationError("Seul le locataire peut ajouter un avis");
      }

      // Vérifier si la location est terminée
      if (rental.status !== "completed") {
        throw new ValidationError(
          "Vous ne pouvez pas ajouter un avis pour une location non terminée"
        );
      }

      // Vérifier si un avis existe déjà
      if (rental.review) {
        throw new ValidationError("Un avis existe déjà pour cette location");
      }

      // Ajouter l'avis
      rental.review = {
        rating,
        comment,
        date: new Date(),
      };

      await rental.save();

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "review_added",
        "Avis ajouté à la location"
      );

      const response: RentalResponse = {
        message: "Avis ajouté avec succès",
        rental,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
