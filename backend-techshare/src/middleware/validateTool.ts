import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

// Constantes de validation
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MAX_IMAGES = 5;
const VALID_CATEGORIES = [
  "bricolage",
  "jardinage",
  "nettoyage",
  "cuisine",
  "informatique",
  "autre",
];

export const validateTool = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { name, description, category, price, location } = req.body;

    // Validation du nom
    if (!name || typeof name !== "string") {
      throw new ValidationError(
        "Le nom est requis et doit être une chaîne de caractères"
      );
    }

    if (name.length < MIN_NAME_LENGTH) {
      throw new ValidationError(
        `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères`
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères`
      );
    }

    // Validation de la description
    if (!description || typeof description !== "string") {
      throw new ValidationError(
        "La description est requise et doit être une chaîne de caractères"
      );
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`
      );
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`
      );
    }

    // Validation de la catégorie
    if (!category || typeof category !== "string") {
      throw new ValidationError(
        "La catégorie est requise et doit être une chaîne de caractères"
      );
    }

    if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
      throw new ValidationError(
        `La catégorie doit être l'une des suivantes : ${VALID_CATEGORIES.join(
          ", "
        )}`
      );
    }

    // Validation du prix
    if (!price || typeof price !== "number") {
      throw new ValidationError("Le prix est requis et doit être un nombre");
    }

    if (price < MIN_PRICE || price > MAX_PRICE) {
      throw new ValidationError(
        `Le prix doit être compris entre ${MIN_PRICE} et ${MAX_PRICE}`
      );
    }

    // Validation de la localisation
    if (!location || typeof location !== "object") {
      throw new ValidationError(
        "La localisation est requise et doit être un objet"
      );
    }

    if (location.type !== "Point") {
      throw new ValidationError('Le type de localisation doit être "Point"');
    }

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new ValidationError(
        "Les coordonnées doivent être un tableau de 2 nombres [longitude, latitude]"
      );
    }

    const [longitude, latitude] = location.coordinates;
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new ValidationError(
        "Les coordonnées doivent être des nombres valides (longitude: -180 à 180, latitude: -90 à 90)"
      );
    }

    // Validation des images (si présentes)
    if (req.files && Array.isArray(req.files)) {
      if (req.files.length > MAX_IMAGES) {
        throw new ValidationError(
          `Le nombre maximum d'images autorisé est ${MAX_IMAGES}`
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
