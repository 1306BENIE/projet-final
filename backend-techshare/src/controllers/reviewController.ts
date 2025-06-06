import { Request, Response, NextFunction } from "express";
import { Review, Rental } from "../models";
import { IReview } from "../interfaces/review.interface";
import {
  ValidationError,
  AuthenticationError,
  DatabaseError,
} from "../utils/errors";
import { Types } from "mongoose";

// Interface pour les données de révision
interface ReviewData {
  toolId: string;
  rentalId: string;
  rating: number;
  comment: string;
}

// Interface pour les réponses d'API
interface ReviewResponse {
  message: string;
  review?: IReview;
  reviews?: IReview[];
}

export const reviewController = {
  // Create a new review
  async createReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Utilisateur non authentifié");
      }

      const { toolId, rentalId, rating, comment } = req.body as ReviewData;

      // Validation des champs requis
      if (!toolId || !rentalId || !rating || !comment) {
        throw new ValidationError("Tous les champs sont requis", [
          { field: "toolId", message: "L'ID de l'outil est requis" },
          { field: "rentalId", message: "L'ID de la location est requis" },
          { field: "rating", message: "La note est requise" },
          { field: "comment", message: "Le commentaire est requis" },
        ]);
      }

      // Validation de la note
      if (rating < 1 || rating > 5) {
        throw new ValidationError("La note doit être comprise entre 1 et 5");
      }

      // Vérifier si la location existe et appartient à l'utilisateur
      const rental = await Rental.findOne({
        _id: new Types.ObjectId(rentalId),
        renter: new Types.ObjectId(req.user.userId),
        status: "completed",
      });

      if (!rental) {
        throw new ValidationError("Location non trouvée ou non terminée");
      }

      // Vérifier si l'utilisateur a déjà laissé un avis pour cette location
      const existingReview = await Review.findOne({
        user: new Types.ObjectId(req.user.userId),
        rental: new Types.ObjectId(rentalId),
      });

      if (existingReview) {
        throw new ValidationError(
          "Vous avez déjà laissé un avis pour cette location"
        );
      }

      const review = new Review({
        user: new Types.ObjectId(req.user.userId),
        tool: new Types.ObjectId(toolId),
        rental: new Types.ObjectId(rentalId),
        rating,
        comment,
      });

      await review.save();

      const response: ReviewResponse = {
        message: "Avis créé avec succès",
        review,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Get reviews by tool
  async getReviewsByTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { toolId } = req.params;

      if (!toolId) {
        throw new ValidationError("L'ID de l'outil est requis");
      }

      const reviews = await Review.find({ tool: new Types.ObjectId(toolId) })
        .populate("user", "firstName lastName rating")
        .populate("tool", "name category")
        .sort({ createdAt: -1 });

      const response: ReviewResponse = {
        message: reviews.length
          ? "Avis récupérés avec succès"
          : "Aucun avis trouvé",
        reviews,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Get reviews by user
  async getReviewsByUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new ValidationError("L'ID de l'utilisateur est requis");
      }

      const reviews = await Review.find({ user: new Types.ObjectId(userId) })
        .populate("tool", "name category price")
        .populate("rental", "startDate endDate")
        .sort({ createdAt: -1 });

      const response: ReviewResponse = {
        message: reviews.length
          ? "Avis récupérés avec succès"
          : "Aucun avis trouvé",
        reviews,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Update a review
  async updateReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Utilisateur non authentifié");
      }

      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      if (!reviewId) {
        throw new ValidationError("L'ID de l'avis est requis");
      }

      if (!rating || !comment) {
        throw new ValidationError("La note et le commentaire sont requis");
      }

      if (rating < 1 || rating > 5) {
        throw new ValidationError("La note doit être comprise entre 1 et 5");
      }

      const review = await Review.findOne({
        _id: new Types.ObjectId(reviewId),
        user: new Types.ObjectId(req.user.userId),
      });

      if (!review) {
        throw new DatabaseError("Avis non trouvé");
      }

      // Vérifier si l'avis a été créé il y a moins de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (review.createdAt < thirtyDaysAgo) {
        throw new ValidationError(
          "Vous ne pouvez plus modifier cet avis après 30 jours"
        );
      }

      review.rating = rating;
      review.comment = comment;
      await review.save();

      const response: ReviewResponse = {
        message: "Avis mis à jour avec succès",
        review,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Delete a review
  async deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Utilisateur non authentifié");
      }

      const { reviewId } = req.params;

      if (!reviewId) {
        throw new ValidationError("L'ID de l'avis est requis");
      }

      const review = await Review.findOne({
        _id: new Types.ObjectId(reviewId),
        user: new Types.ObjectId(req.user.userId),
      });

      if (!review) {
        throw new DatabaseError("Avis non trouvé");
      }

      // Vérifier si l'avis a été créé il y a moins de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (review.createdAt < thirtyDaysAgo) {
        throw new ValidationError(
          "Vous ne pouvez plus supprimer cet avis après 30 jours"
        );
      }

      await review.deleteOne();

      const response: ReviewResponse = {
        message: "Avis supprimé avec succès",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
