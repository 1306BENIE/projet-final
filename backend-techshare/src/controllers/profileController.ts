import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Rental } from "../models/Rental";
import { ValidationError, DatabaseError } from "../utils/errors";
import { Types } from "mongoose";

// Interface pour les données de profil
interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Interface pour les réponses d'API
interface ProfileResponse {
  message: string;
  user?: {
    id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    role: string;
  };
}

export const profileController = {
  // Get user profile
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new ValidationError("Utilisateur non authentifié");
      }

      const user = await User.findById(req.user.userId).select("-password");
      if (!user) {
        throw new DatabaseError("Utilisateur non trouvé");
      }

      const response: ProfileResponse = {
        message: "Profil récupéré avec succès",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new ValidationError("Utilisateur non authentifié");
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new DatabaseError("Utilisateur non trouvé");
      }

      const { firstName, lastName, phone, address } = req.body as ProfileData;

      // Validation des données
      if (address) {
        if (
          !address.street ||
          !address.city ||
          !address.postalCode ||
          !address.country
        ) {
          throw new ValidationError("Tous les champs de l'adresse sont requis");
        }
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      await user.save();

      const response: ProfileResponse = {
        message: "Profil mis à jour avec succès",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new ValidationError("Utilisateur non authentifié");
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new DatabaseError("Utilisateur non trouvé");
      }

      // Vérifier si l'utilisateur a des locations en cours
      const activeRentals = await Rental.find({
        $or: [
          { renter: user._id, status: { $in: ["pending", "active"] } },
          { owner: user._id, status: { $in: ["pending", "active"] } },
        ],
      });

      if (activeRentals.length > 0) {
        throw new ValidationError(
          "Impossible de supprimer le compte avec des locations actives",
          [
            {
              field: "rentals",
              message: `${activeRentals.length} location(s) active(s)`,
            },
          ]
        );
      }

      // Supprimer l'utilisateur
      await user.deleteOne();

      res.status(200).json({ message: "Compte supprimé avec succès" });
    } catch (error) {
      next(error);
    }
  },
};
