import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import {
  ValidationError,
  AuthenticationError,
  DatabaseError,
} from "../utils/errors";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const errorHandler = (fn: AsyncFunction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      // Log détaillé de l'erreur
      logger.error("Erreur dans le contrôleur:", {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        request: {
          path: req.path,
          method: req.method,
          body: req.body,
          params: req.params,
          query: req.query,
          headers: {
            ...req.headers,
            authorization: req.headers.authorization ? "[REDACTED]" : undefined,
          },
        },
        user: req.user
          ? {
              id: req.user.userId,
              role: req.user.role,
            }
          : undefined,
      });

      // Gestion des erreurs spécifiques
      if (error instanceof ValidationError) {
        console.error("Erreur de validation:", {
          message: error.message,
          details: error.errors,
          path: req.path,
          params: req.params,
        });
        return res.status(400).json({
          error: "ValidationError",
          message: error.message,
          details: error.errors || [],
        });
      }

      if (error instanceof AuthenticationError) {
        console.error("Erreur d'authentification:", {
          message: error.message,
          code: error.code,
          path: req.path,
        });
        return res.status(error.code || 401).json({
          error: "AuthenticationError",
          message: error.message,
        });
      }

      if (error instanceof DatabaseError) {
        console.error("Erreur de base de données:", {
          message: error.message,
          path: req.path,
        });
        return res.status(404).json({
          error: "DatabaseError",
          message: error.message,
        });
      }

      // Erreur par défaut
      console.error("Erreur serveur inattendue:", {
        message: error.message,
        stack: error.stack,
        path: req.path,
      });
      return res.status(500).json({
        error: "InternalServerError",
        message: "Une erreur inattendue est survenue",
        ...(process.env.NODE_ENV === "development" && {
          details: error.message,
          stack: error.stack,
        }),
      });
    }
  };
};
