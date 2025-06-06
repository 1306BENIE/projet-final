import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ValidationError } from "../utils/errors";

export const validateObjectId = (paramName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError(`ID ${paramName} invalide`);
    }
    next();
  };
};
