import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export const isAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    throw new ValidationError("Accès administrateur requis");
  }
  next();
};
