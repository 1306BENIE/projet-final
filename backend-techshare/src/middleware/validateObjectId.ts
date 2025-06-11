import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ValidationError } from "../utils/errors";

export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    console.log(`Validation de l'ID ${paramName}:`, id);
    console.log("Type de l'ID:", typeof id);
    console.log("Longueur de l'ID:", id?.length);
    console.log("Est-ce un ObjectId valide:", Types.ObjectId.isValid(id));

    if (!id) {
      console.error(`ID ${paramName} manquant dans les paramètres`);
      return res.status(400).json({
        error: "ValidationError",
        message: `ID ${paramName} manquant`,
      });
    }

    if (!Types.ObjectId.isValid(id)) {
      console.error(`Format d'ID ${paramName} invalide:`, id);
      return res.status(400).json({
        error: "ValidationError",
        message: `Format d'ID ${paramName} invalide`,
      });
    }

    console.log(`ID ${paramName} valide:`, id);
    next();
  };
};
