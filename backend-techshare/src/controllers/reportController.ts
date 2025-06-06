import { Request, Response } from "express";
import { securityLogService } from "../services/securityLogService";
import { logger } from "../utils/logger";
import { Rental } from "../models/Rental";
import { Tool } from "../models/Tool";
import { User } from "../models/User";
import { Review } from "../models/Review";

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

export const reportController = {
  // Get security logs (admin only)
  async getSecurityLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { startDate, endDate, action, userId } = req.query;
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      if (action) query.action = action;
      if (userId) query.userId = userId;

      const logs = await securityLogService.getLogs(query);
      res.json(logs);
    } catch (error) {
      handleError(error, res, "Error fetching security logs");
    }
  },

  // Generate activity report (admin only)
  async generateActivityReport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { startDate, endDate } = req.query;
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const [newUsers, newTools, newRentals, completedRentals, revenue] =
        await Promise.all([
          User.countDocuments({ ...query, createdAt: { $exists: true } }),
          Tool.countDocuments({ ...query, createdAt: { $exists: true } }),
          Rental.countDocuments({ ...query, createdAt: { $exists: true } }),
          Rental.countDocuments({ ...query, status: "completed" }),
          Rental.aggregate([
            { $match: { ...query, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
        ]);

      res.json({
        period: {
          start: startDate || "all time",
          end: endDate || "now",
        },
        metrics: {
          newUsers,
          newTools,
          newRentals,
          completedRentals,
          revenue: revenue[0]?.total || 0,
        },
      });
    } catch (error) {
      handleError(error, res, "Error generating activity report");
    }
  },

  // Generate user report (admin only)
  async generateUserReport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { userId } = req.params;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const [
        ownedTools,
        activeRentals,
        completedRentals,
        totalSpent,
        securityLogs,
      ] = await Promise.all([
        Tool.countDocuments({ owner: userId }),
        Rental.countDocuments({ renter: userId, status: "active" }),
        Rental.countDocuments({ renter: userId, status: "completed" }),
        Rental.aggregate([
          { $match: { renter: userId, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        securityLogService.getLogs({ userId }),
      ]);

      res.json({
        user,
        activity: {
          ownedTools,
          rentals: {
            active: activeRentals,
            completed: completedRentals,
          },
          totalSpent: totalSpent[0]?.total || 0,
        },
        securityLogs,
      });
    } catch (error) {
      handleError(error, res, "Error generating user report");
    }
  },

  // Generate tool report (admin only)
  async generateToolReport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { toolId } = req.params;
      const tool = await Tool.findById(toolId).populate(
        "owner",
        "firstName lastName email"
      );

      if (!tool) {
        res.status(404).json({ message: "Tool not found" });
        return;
      }

      const [
        totalRentals,
        activeRentals,
        completedRentals,
        totalRevenue,
        securityLogs,
      ] = await Promise.all([
        Rental.countDocuments({ tool: toolId }),
        Rental.countDocuments({ tool: toolId, status: "active" }),
        Rental.countDocuments({ tool: toolId, status: "completed" }),
        Rental.aggregate([
          { $match: { tool: toolId, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        securityLogService.getLogs({ toolId }),
      ]);

      res.json({
        tool,
        activity: {
          rentals: {
            total: totalRentals,
            active: activeRentals,
            completed: completedRentals,
          },
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        securityLogs,
      });
    } catch (error) {
      handleError(error, res, "Error generating tool report");
    }
  },

  // Get activity logs (admin only)
  async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { startDate, endDate, type } = req.query;
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      if (type) query.type = type;

      const logs = await securityLogService.getLogs({
        ...query,
        type: "activity",
      });
      res.json(logs);
    } catch (error) {
      handleError(error, res, "Error fetching activity logs");
    }
  },

  // Get error logs (admin only)
  async getErrorLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { startDate, endDate, level } = req.query;
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      if (level) query.level = level;

      const logs = await securityLogService.getLogs({
        ...query,
        type: "error",
      });
      res.json(logs);
    } catch (error) {
      handleError(error, res, "Error fetching error logs");
    }
  },

  // Get user activity (admin only)
  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const query: any = { userId };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const [securityLogs, rentals, tools] = await Promise.all([
        securityLogService.getLogs(query),
        Rental.find({ renter: userId, ...query }).sort({ createdAt: -1 }),
        Tool.find({ owner: userId, ...query }).sort({ createdAt: -1 }),
      ]);

      res.json({
        securityLogs,
        rentals,
        tools,
      });
    } catch (error) {
      handleError(error, res, "Error fetching user activity");
    }
  },

  // Get tool activity (admin only)
  async getToolActivity(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
      }

      const { toolId } = req.params;
      const { startDate, endDate } = req.query;
      const query: any = { toolId };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const [securityLogs, rentals, reviews] = await Promise.all([
        securityLogService.getLogs(query),
        Rental.find({ tool: toolId, ...query }).sort({ createdAt: -1 }),
        Review.find({ tool: toolId, ...query }).sort({ createdAt: -1 }),
      ]);

      res.json({
        securityLogs,
        rentals,
        reviews,
      });
    } catch (error) {
      handleError(error, res, "Error fetching tool activity");
    }
  },
};
