import { Tool } from "../models/Tool";
import { Rental } from "../models/Rental";
import { Review } from "../models/Review";
import { logger } from "../utils/logger";
import { ValidationError, DatabaseError } from "../utils/errors";
import { ITool } from "../interfaces/tool.interface";
import { IRental } from "../interfaces/rental.interface";
import { IReview } from "../interfaces/review.interface";
import { Types } from "mongoose";

interface UserPreferences {
  categories: Map<string, number>;
  priceRange: {
    min: number;
    max: number;
  };
  locations: Set<string>;
}

interface UserHistory {
  rentals: IRental[];
  reviews: IReview[];
}

interface ScoredTool {
  tool: ITool;
  score: number;
}

interface PopularToolsOptions {
  page: number;
  limit: number;
  category?: string;
  timeRange: string;
}

interface PopularToolsResult {
  tools: ITool[];
  total: number;
}

class RecommendationService {
  /**
   * Génère des recommandations personnalisées pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum de recommandations à retourner
   * @returns Liste des outils recommandés
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<ITool[]> {
    try {
      if (!userId) {
        throw new ValidationError("ID utilisateur requis");
      }

      if (limit < 1 || limit > 50) {
        throw new ValidationError("La limite doit être comprise entre 1 et 50");
      }

      // 1. Récupérer l'historique de l'utilisateur
      const userHistory = await this.getUserHistory(userId);

      // Si l'utilisateur n'a pas d'historique, retourner les outils les plus populaires
      if (
        userHistory.rentals.length === 0 &&
        userHistory.reviews.length === 0
      ) {
        const result = await this.getPopularTools({
          page: 1,
          limit,
          timeRange: "month",
        });
        return result.tools;
      }

      // 2. Analyser les préférences de l'utilisateur
      const preferences = await this.analyzeUserPreferences(userHistory);

      // 3. Générer les recommandations
      return this.generateRecommendations(userId, preferences, limit);
    } catch (error) {
      logger.error("Erreur lors de la génération des recommandations:", error);
      throw error instanceof ValidationError
        ? error
        : new DatabaseError("Erreur lors de la génération des recommandations");
    }
  }

  /**
   * Récupère l'historique d'un utilisateur (locations et avis)
   * @param userId - ID de l'utilisateur
   * @returns Historique de l'utilisateur
   */
  private async getUserHistory(userId: string): Promise<UserHistory> {
    try {
      const [rentals, reviews] = await Promise.all([
        Rental.find({ renter: new Types.ObjectId(userId) })
          .populate("tool")
          .sort({ createdAt: -1 })
          .limit(50),
        Review.find({ user: new Types.ObjectId(userId) })
          .populate("tool")
          .sort({ createdAt: -1 })
          .limit(50),
      ]);

      return { rentals, reviews };
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération de l'historique utilisateur:",
        error
      );
      throw new DatabaseError(
        "Erreur lors de la récupération de l'historique utilisateur"
      );
    }
  }

  /**
   * Analyse les préférences d'un utilisateur basées sur son historique
   * @param history - Historique de l'utilisateur
   * @returns Préférences de l'utilisateur
   */
  private async analyzeUserPreferences(
    history: UserHistory
  ): Promise<UserPreferences> {
    try {
      const preferences: UserPreferences = {
        categories: new Map<string, number>(),
        priceRange: { min: Infinity, max: 0 },
        locations: new Set<string>(),
      };

      // Analyser les locations
      for (const rental of history.rentals) {
        const tool = rental.tool as unknown as ITool;
        if (tool) {
          // Catégories
          const categoryCount =
            preferences.categories.get(tool.category.toString()) || 0;
          preferences.categories.set(
            tool.category.toString(),
            categoryCount + 1
          );

          // Prix
          preferences.priceRange.min = Math.min(
            preferences.priceRange.min,
            tool.price
          );
          preferences.priceRange.max = Math.max(
            preferences.priceRange.max,
            tool.price
          );

          // Localisation
          if (tool.location) {
            preferences.locations.add(tool.location.coordinates.join(","));
          }
        }
      }

      // Analyser les avis
      for (const review of history.reviews) {
        const tool = review.tool as unknown as ITool;
        if (tool && review.rating >= 4) {
          const categoryCount =
            preferences.categories.get(tool.category.toString()) || 0;
          preferences.categories.set(
            tool.category.toString(),
            categoryCount + 2
          ); // Donner plus de poids aux avis positifs
        }
      }

      return preferences;
    } catch (error) {
      logger.error(
        "Erreur lors de l'analyse des préférences utilisateur:",
        error
      );
      throw new DatabaseError(
        "Erreur lors de l'analyse des préférences utilisateur"
      );
    }
  }

  /**
   * Génère des recommandations basées sur les préférences de l'utilisateur
   * @param userId - ID de l'utilisateur
   * @param preferences - Préférences de l'utilisateur
   * @param limit - Nombre maximum de recommandations
   * @returns Liste des outils recommandés
   */
  private async generateRecommendations(
    userId: string,
    preferences: UserPreferences,
    limit: number
  ): Promise<ITool[]> {
    try {
      // Convertir les préférences en critères de recherche
      const categoryIds = Array.from(preferences.categories.keys());
      const priceRange = preferences.priceRange;

      // Construire la requête
      const query: any = {
        owner: { $ne: new Types.ObjectId(userId) }, // Exclure les outils de l'utilisateur
        isAvailable: true,
      };

      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      }

      if (priceRange.min !== Infinity && priceRange.max !== 0) {
        query.price = {
          $gte: priceRange.min * 0.8, // 20% de marge
          $lte: priceRange.max * 1.2,
        };
      }

      // Rechercher les outils correspondants
      const tools = await Tool.find(query)
        .populate("owner", "firstName lastName rating")
        .populate("category", "name")
        .sort({ rating: -1, rentalCount: -1 })
        .limit(limit * 2); // Récupérer plus d'outils pour le filtrage

      // Calculer un score de pertinence pour chaque outil
      const scoredTools: ScoredTool[] = tools.map((tool) => {
        let score = 0;

        // Score basé sur la catégorie
        const categoryWeight =
          preferences.categories.get(tool.category.toString()) || 0;
        score += categoryWeight * 2;

        // Score basé sur le prix
        const priceScore =
          1 -
          Math.abs(tool.price - (priceRange.min + priceRange.max) / 2) /
            priceRange.max;
        score += priceScore * 1.5;

        // Score basé sur la note
        score += tool.rating * 2;

        // Score basé sur le nombre de locations
        score += Math.log(tool.rentalCount + 1);

        return { tool, score };
      });

      // Trier par score et retourner les meilleurs résultats
      return scoredTools
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.tool);
    } catch (error) {
      logger.error("Erreur lors de la génération des recommandations:", error);
      throw new DatabaseError(
        "Erreur lors de la génération des recommandations"
      );
    }
  }

  /**
   * Récupère les outils les plus populaires avec pagination et filtrage
   * @param options - Options de pagination et filtrage
   * @returns Liste des outils populaires et nombre total
   */
  async getPopularTools(
    options: PopularToolsOptions
  ): Promise<PopularToolsResult> {
    try {
      const { page, limit, category, timeRange } = options;

      // Calculer la date de début en fonction de la période
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

      // Construire la requête
      const query: any = {
        isAvailable: true,
        createdAt: { $gte: startDate },
      };

      if (category) {
        query.category = new Types.ObjectId(category);
      }

      // Compter le nombre total d'outils
      const total = await Tool.countDocuments(query);

      // Récupérer les outils avec pagination
      const tools = await Tool.find(query)
        .populate("owner", "firstName lastName rating")
        .populate("category", "name")
        .sort({ rating: -1, rentalCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return { tools, total };
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des outils populaires:",
        error
      );
      throw new DatabaseError(
        "Erreur lors de la récupération des outils populaires"
      );
    }
  }

  /**
   * Trouve des outils similaires à un outil donné
   * @param toolId - ID de l'outil de référence
   * @param limit - Nombre maximum d'outils similaires à retourner
   * @returns Liste des outils similaires
   */
  async getSimilarTools(toolId: string, limit: number = 5): Promise<ITool[]> {
    try {
      if (!toolId) {
        throw new ValidationError("ID de l'outil requis");
      }

      if (limit < 1 || limit > 20) {
        throw new ValidationError("La limite doit être comprise entre 1 et 20");
      }

      const tool = await Tool.findById(toolId);
      if (!tool) {
        throw new ValidationError("Outil non trouvé");
      }

      return await Tool.find({
        _id: { $ne: new Types.ObjectId(toolId) },
        category: tool.category,
        isAvailable: true,
      })
        .populate("owner", "firstName lastName rating")
        .populate("category", "name")
        .sort({ rating: -1, rentalCount: -1 })
        .limit(limit);
    } catch (error) {
      logger.error("Erreur lors de la recherche d'outils similaires:", error);
      throw error instanceof ValidationError
        ? error
        : new DatabaseError("Erreur lors de la recherche d'outils similaires");
    }
  }
}

let recommendationService: RecommendationService;

export const initializeRecommendationService = (): RecommendationService => {
  recommendationService = new RecommendationService();
  return recommendationService;
};

export const getRecommendationService = (): RecommendationService => {
  if (!recommendationService) {
    throw new DatabaseError("RecommendationService n'a pas été initialisé");
  }
  return recommendationService;
};
