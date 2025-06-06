import { Tool } from "../models/Tool";
import { Types } from "mongoose";
import { logger } from "../utils/logger";

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  maxDistance?: number;
  availability?: {
    startDate: Date;
    endDate: Date;
  };
  searchTerm?: string;
}

class SearchService {
  async searchTools(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const query: any = {};

      // Filtre par catégorie
      if (filters.category) {
        query.category = new Types.ObjectId(filters.category);
      }

      // Filtre par prix
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
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
        Tool.find(query)
          .populate("category", "name")
          .populate("owner", "name email")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Tool.countDocuments(query),
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
    } catch (error) {
      logger.error("Erreur lors de la recherche d'outils:", error);
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }
}

export const searchService = new SearchService();
