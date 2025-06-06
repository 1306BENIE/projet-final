import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Tool } from "../models/Tool";
import { Review } from "../models/Review";
import { Rental } from "../models/Rental";
import { logger } from "../utils/logger";
import { securityLogService } from "../services/securityLogService";
import { ValidationError } from "../utils/errors";

// Constantes de validation
const MIN_PAGE = 1;
const MAX_PAGE = 100;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

// Interfaces
interface AdminResponse {
  message: string;
  data?: any;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalTools: number;
  totalRentals: number;
  totalReviews: number;
  activeRentals: number;
  totalRevenue: number;
  recentActivity?: any[];
}

// Gestionnaire d'erreurs centralisé
const handleError = (
  error: any,
  res: Response,
  next: NextFunction,
  message: string
): void => {
  logger.error(`${message}:`, error);

  if (error.name === "ValidationError") {
    res.status(400).json({
      message: "Erreur de validation",
      errors: Object.values(error.errors).map((err: any) => err.message),
    });
    return;
  }

  if (error.name === "DatabaseError") {
    res.status(500).json({
      message: "Erreur de base de données",
      error: error.message,
    });
    return;
  }

  next(error);
};

// Middleware de vérification des droits admin
const checkAdminAccess = (req: Request): void => {
  if (!req.user?.userId || req.user.role !== "admin") {
    throw new ValidationError("Accès administrateur requis");
  }
};

export const adminController = {
  // Get all users
  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { page = 1, limit = 20, search, role, isBanned } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (
        pageNum < MIN_PAGE ||
        pageNum > MAX_PAGE ||
        limitNum < MIN_LIMIT ||
        limitNum > MAX_LIMIT
      ) {
        throw new ValidationError(
          `La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`
        );
      }

      const filter: any = {};
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (role) filter.role = role;
      if (isBanned !== undefined) filter.isBanned = isBanned === "true";

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        User.countDocuments(filter),
      ]);

      const response: AdminResponse = {
        message: "Utilisateurs récupérés avec succès",
        data: users,
        metadata: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(
        error,
        res,
        next,
        "Erreur lors de la récupération des utilisateurs"
      );
    }
  },

  // Ban user
  async banUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { userId } = req.params;
      if (!Types.ObjectId.isValid(userId)) {
        throw new ValidationError("ID utilisateur invalide");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ValidationError("Utilisateur non trouvé");
      }

      if (user.isBanned) {
        throw new ValidationError("L'utilisateur est déjà banni");
      }

      user.isBanned = true;
      await user.save();

      // Log de l'événement
      if (req.user?.userId) {
        await securityLogService.logEvent(
          new Types.ObjectId(req.user.userId),
          "BAN_USER",
          JSON.stringify({
            targetUserId: userId,
            reason: req.body.reason || "Non spécifié",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          })
        );
      }

      const response: AdminResponse = {
        message: "Utilisateur banni avec succès",
        data: { userId: user._id, email: user.email },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(
        error,
        res,
        next,
        "Erreur lors du bannissement de l'utilisateur"
      );
    }
  },

  // Unban user
  async unbanUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { userId } = req.params;
      if (!Types.ObjectId.isValid(userId)) {
        throw new ValidationError("ID utilisateur invalide");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ValidationError("Utilisateur non trouvé");
      }

      if (!user.isBanned) {
        throw new ValidationError("L'utilisateur n'est pas banni");
      }

      user.isBanned = false;
      await user.save();

      // Log de l'événement
      if (req.user?.userId) {
        await securityLogService.logEvent(
          new Types.ObjectId(req.user.userId),
          "UNBAN_USER",
          JSON.stringify({
            targetUserId: userId,
            reason: req.body.reason || "Non spécifié",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          })
        );
      }

      const response: AdminResponse = {
        message: "Utilisateur débanni avec succès",
        data: { userId: user._id, email: user.email },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(
        error,
        res,
        next,
        "Erreur lors du débannissement de l'utilisateur"
      );
    }
  },

  // Get all tools
  async getTools(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { page = 1, limit = 20, search, category, status } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (
        pageNum < MIN_PAGE ||
        pageNum > MAX_PAGE ||
        limitNum < MIN_LIMIT ||
        limitNum > MAX_LIMIT
      ) {
        throw new ValidationError(
          `La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`
        );
      }

      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      if (category) filter.category = category;
      if (status) filter.status = status;

      const [tools, total] = await Promise.all([
        Tool.find(filter)
          .populate("owner", "firstName lastName email")
          .populate("category", "name")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Tool.countDocuments(filter),
      ]);

      const response: AdminResponse = {
        message: "Outils récupérés avec succès",
        data: tools,
        metadata: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(
        error,
        res,
        next,
        "Erreur lors de la récupération des outils"
      );
    }
  },

  // Delete a tool
  async deleteTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { toolId } = req.params;
      if (!Types.ObjectId.isValid(toolId)) {
        throw new ValidationError("ID outil invalide");
      }

      const tool = await Tool.findById(toolId);
      if (!tool) {
        throw new ValidationError("Outil non trouvé");
      }

      await tool.deleteOne();

      // Log de l'événement
      if (req.user?.userId) {
        await securityLogService.logEvent(
          new Types.ObjectId(req.user.userId),
          "DELETE_TOOL",
          JSON.stringify({
            toolId,
            toolName: tool.name,
            reason: req.body.reason || "Non spécifié",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          })
        );
      }

      const response: AdminResponse = {
        message: "Outil supprimé avec succès",
        data: { toolId: tool._id, name: tool.name },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(error, res, next, "Erreur lors de la suppression de l'outil");
    }
  },

  // Get all reviews
  async getReviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { page = 1, limit = 20, rating, toolId, userId } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (
        pageNum < MIN_PAGE ||
        pageNum > MAX_PAGE ||
        limitNum < MIN_LIMIT ||
        limitNum > MAX_LIMIT
      ) {
        throw new ValidationError(
          `La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`
        );
      }

      const filter: any = {};
      if (rating) filter.rating = Number(rating);
      if (toolId) filter.tool = toolId;
      if (userId) filter.user = userId;

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate("user", "firstName lastName email")
          .populate("tool", "name")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Review.countDocuments(filter),
      ]);

      const response: AdminResponse = {
        message: "Avis récupérés avec succès",
        data: reviews,
        metadata: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(error, res, next, "Erreur lors de la récupération des avis");
    }
  },

  // Delete a review
  async deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const { reviewId } = req.params;
      if (!Types.ObjectId.isValid(reviewId)) {
        throw new ValidationError("ID avis invalide");
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new ValidationError("Avis non trouvé");
      }

      await review.deleteOne();

      // Log de l'événement
      if (req.user?.userId) {
        await securityLogService.logEvent(
          new Types.ObjectId(req.user.userId),
          "DELETE_REVIEW",
          JSON.stringify({
            reviewId,
            toolId: review.tool,
            userId: review.user,
            reason: req.body.reason || "Non spécifié",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          })
        );
      }

      const response: AdminResponse = {
        message: "Avis supprimé avec succès",
        data: { reviewId: review._id },
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(error, res, next, "Erreur lors de la suppression de l'avis");
    }
  },

  // Get dashboard stats
  async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      checkAdminAccess(req);

      const [
        totalUsers,
        totalTools,
        totalRentals,
        totalReviews,
        activeRentals,
        totalRevenue,
        recentActivity,
      ] = await Promise.all([
        User.countDocuments(),
        Tool.countDocuments(),
        Rental.countDocuments(),
        Review.countDocuments(),
        Rental.countDocuments({ status: "active" }),
        Rental.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Rental.find()
          .populate("tool", "name")
          .populate("renter", "firstName lastName")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const stats: DashboardStats = {
        totalUsers,
        totalTools,
        totalRentals,
        totalReviews,
        activeRentals,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentActivity,
      };

      const response: AdminResponse = {
        message: "Statistiques récupérées avec succès",
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      handleError(
        error,
        res,
        next,
        "Erreur lors de la récupération des statistiques"
      );
    }
  },
};
