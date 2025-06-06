import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { logger } from "../utils/logger";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
    };

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
    return;
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First check if user is authenticated
    await auth(req, res, () => {
      // Then check if user is admin
      if (req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin privileges required." });
      }
      next();
      return;
    });
    return;
  } catch (error) {
    logger.error("Admin authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
