import { Request, Response } from "express";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { securityLogService } from "../services/securityLogService";

// Ajouter un gestionnaire d'erreurs centralisé
const handleError = (error: any, res: Response, message: string): void => {
  logger.error(`${message}:`, error);

  if (error.name === "ValidationError") {
    res.status(400).json({
      message: "Erreur de validation",
      errors: Object.values(error.errors).map((err: any) => err.message),
    });
    return;
  }

  res.status(500).json({ message });
  return;
};

export const adminUserController = {
  // Get all users with pagination, sorting, search and filtering
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      // Récupération des paramètres
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        role,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Construction de la requête
      let query: any = {};

      // Ajout de la recherche
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Ajout du filtre par rôle
      if (role) {
        query.role = role;
      }

      // Exécution de la requête avec pagination et tri
      const users = await User.find(query)
        .select("-password")
        .sort({ [sortBy as string]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit));

      // Comptage total des utilisateurs
      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      handleError(error, res, "Error fetching users");
    }
  },

  // Ban a user
  async banUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { userId } = req.params;
      const { reason } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.isBanned = true;
      await user.save();

      // Log the action
      await securityLogService.logAction({
        action: "BAN_USER",
        userId: req.user.userId,
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        status: "success",
        details: { targetUser: userId, reason },
      });

      res.json({ message: "User banned successfully" });
    } catch (error) {
      handleError(error, res, "Error banning user");
    }
  },

  // Unban a user
  async unbanUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.isBanned = false;
      await user.save();

      // Log the action
      await securityLogService.logAction({
        action: "UNBAN_USER",
        userId: req.user.userId,
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        status: "success",
        details: { targetUser: userId },
      });

      res.json({ message: "User unbanned successfully" });
    } catch (error) {
      handleError(error, res, "Error unbanning user");
    }
  },
};
