import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const checkRoleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentification requise" });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(
          `Tentative d'accès non autorisé par l'utilisateur ${req.user.userId} avec le rôle ${req.user.role}`
        );
        return res.status(403).json({
          message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
        });
      }

      next();
    } catch (error) {
      logger.error("Erreur lors de la vérification des rôles:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la vérification des permissions" });
    }
  };
};
