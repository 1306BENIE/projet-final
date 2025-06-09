import { Request, Response, NextFunction } from "express";
import { Tool } from "../models";
import {
  ValidationError,
  DatabaseError,
  AuthenticationError,
} from "../utils/errors";
import { Types } from "mongoose";
import { ITool } from "../interfaces/tool.interface";
import { securityLogService } from "../services/securityLogService";

// Interface pour les données d'outil
interface ToolData {
  name: string;
  description: string;
  category: string;
  dailyPrice: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  availability: {
    startDate: Date;
    endDate: Date;
  };
  images: string[];
  status: "available" | "rented" | "maintenance";
}

// Interface pour les filtres de recherche
interface ToolFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  radius?: number;
  startDate?: string;
  endDate?: string;
  status?: "available" | "rented" | "maintenance";
}

// Interface pour les réponses d'API
interface ToolResponse {
  message: string;
  tool?: ITool;
  tools?: ITool[];
}

// Constantes de validation
const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_IMAGES = 5;
const VALID_CATEGORIES = [
  "bricolage",
  "jardinage",
  "nettoyage",
  "cuisine",
  "informatique",
  "autre",
];

export const toolController = {
  // Créer un nouvel outil
  async createTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      // Conversion explicite des champs numériques
      if (req.body.dailyPrice)
        req.body.dailyPrice = Number(req.body.dailyPrice);
      if (req.body.price) req.body.price = Number(req.body.price);

      const toolData = {
        ...req.body,
        owner: new Types.ObjectId(req.user.userId),
      } as ToolData;

      // Récupérer les URLs des images uploadées
      let images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        images = (req.files as any[])
          .map(
            (file) => file.path || file.secure_url || file.location || file.url
          )
          .filter(Boolean);
      }
      toolData.images = images;

      // Validation des champs requis
      if (
        !toolData.name ||
        !toolData.description ||
        !toolData.category ||
        !toolData.dailyPrice
      ) {
        throw new ValidationError("Tous les champs sont requis", [
          { field: "name", message: "Le nom est requis" },
          { field: "description", message: "La description est requise" },
          { field: "category", message: "La catégorie est requise" },
          { field: "dailyPrice", message: "Le prix journalier est requis" },
        ]);
      }

      // Validation du nom
      if (toolData.name.length < 3) {
        throw new ValidationError("Le nom doit contenir au moins 3 caractères");
      }

      // Validation de la description
      if (
        toolData.description.length < MIN_DESCRIPTION_LENGTH ||
        toolData.description.length > MAX_DESCRIPTION_LENGTH
      ) {
        throw new ValidationError(
          `La description doit contenir entre ${MIN_DESCRIPTION_LENGTH} et ${MAX_DESCRIPTION_LENGTH} caractères`
        );
      }

      // Validation de la catégorie
      if (!VALID_CATEGORIES.includes(toolData.category.toLowerCase())) {
        throw new ValidationError("Catégorie invalide");
      }

      // Validation du prix
      if (toolData.dailyPrice < MIN_PRICE || toolData.dailyPrice > MAX_PRICE) {
        throw new ValidationError(
          `Le prix journalier doit être compris entre ${MIN_PRICE} et ${MAX_PRICE}`
        );
      }

      // Validation des images
      if (toolData.images && toolData.images.length > MAX_IMAGES) {
        throw new ValidationError(
          `Le nombre maximum d'images est de ${MAX_IMAGES}`
        );
      }

      // Validation des dates de disponibilité
      if (toolData.availability) {
        const { startDate, endDate } = toolData.availability;
        const now = new Date();
        if (startDate < now) {
          throw new ValidationError("La date de début doit être dans le futur");
        }
        if (startDate >= endDate) {
          throw new ValidationError(
            "La date de début doit être antérieure à la date de fin"
          );
        }
      }

      // Validation de la localisation
      if (toolData.location) {
        const { coordinates } = toolData.location;
        if (
          !coordinates ||
          coordinates.length !== 2 ||
          coordinates[0] < -180 ||
          coordinates[0] > 180 ||
          coordinates[1] < -90 ||
          coordinates[1] > 90
        ) {
          throw new ValidationError("Coordonnées géographiques invalides");
        }
      }

      const tool = new Tool(toolData);
      await tool.save();

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "tool_created",
        "Nouvel outil créé"
      );

      const response: ToolResponse = {
        message: "Outil créé avec succès",
        tool,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Obtenir tous les outils avec filtres
  async getTools(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as unknown as ToolFilters;
      let query: any = {};

      // Appliquer les filtres
      if (filters.category) {
        if (!VALID_CATEGORIES.includes(filters.category.toLowerCase())) {
          throw new ValidationError("Catégorie invalide");
        }
        query.category = filters.category.toLowerCase();
      }

      if (filters.minPrice || filters.maxPrice) {
        query.dailyPrice = {};
        if (filters.minPrice) {
          const minPrice = Number(filters.minPrice);
          if (minPrice < MIN_PRICE) {
            throw new ValidationError(
              `Le prix minimum doit être supérieur à ${MIN_PRICE}`
            );
          }
          query.dailyPrice.$gte = minPrice;
        }
        if (filters.maxPrice) {
          const maxPrice = Number(filters.maxPrice);
          if (maxPrice > MAX_PRICE) {
            throw new ValidationError(
              `Le prix maximum doit être inférieur à ${MAX_PRICE}`
            );
          }
          query.dailyPrice.$lte = maxPrice;
        }
      }

      if (filters.status) {
        if (!["available", "rented", "maintenance"].includes(filters.status)) {
          throw new ValidationError("Statut invalide");
        }
        query.status = filters.status;
      }

      // Filtre de disponibilité par date
      if (filters.startDate || filters.endDate) {
        query.availability = {};
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (isNaN(startDate.getTime())) {
            throw new ValidationError("Date de début invalide");
          }
          query.availability.startDate = { $lte: startDate };
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          if (isNaN(endDate.getTime())) {
            throw new ValidationError("Date de fin invalide");
          }
          if (filters.startDate && endDate <= new Date(filters.startDate)) {
            throw new ValidationError(
              "La date de fin doit être après la date de début"
            );
          }
          query.availability.endDate = { $gte: endDate };
        }
      }

      // Recherche basée sur la localisation
      if (filters.location && filters.radius) {
        const [longitude, latitude] = filters.location.split(",").map(Number);
        if (
          isNaN(longitude) ||
          isNaN(latitude) ||
          longitude < -180 ||
          longitude > 180 ||
          latitude < -90 ||
          latitude > 90
        ) {
          throw new ValidationError("Coordonnées géographiques invalides");
        }
        const radius = Number(filters.radius);
        if (radius <= 0 || radius > 100) {
          throw new ValidationError(
            "Le rayon doit être compris entre 0 et 100 kilomètres"
          );
        }
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        };
      }

      const tools = await Tool.find(query)
        .populate("owner", "firstName lastName email")
        .sort({ createdAt: -1 });

      const response: ToolResponse = {
        message: "Outils récupérés avec succès",
        tools,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Obtenir un outil par ID
  async getToolById(req: Request, res: Response): Promise<void> {
    try {
      const { toolId } = req.params;
      console.log("Recherche de l'outil avec l'ID:", toolId);

      const tool = await Tool.findById(toolId)
        .populate("owner", "firstName lastName email")
        .populate("category", "name")
        .lean();

      if (!tool) {
        console.log("Outil non trouvé pour l'ID:", toolId);
        res.status(404).json({
          error: "NotFoundError",
          message: "Outil non trouvé",
        });
        return;
      }

      console.log("Outil trouvé:", tool);
      res.status(200).json({
        message: "Outil récupéré avec succès",
        tool,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'outil:", error);
      res.status(500).json({
        error: "DatabaseError",
        message: "Erreur lors de la récupération de l'outil",
      });
    }
  },

  // Mettre à jour un outil
  async updateTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { id } = req.params;
      if (!id || !Types.ObjectId.isValid(id)) {
        throw new ValidationError("ID d'outil invalide");
      }

      const tool = await Tool.findById(id);
      if (!tool) {
        throw new DatabaseError("Outil non trouvé");
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (tool.owner.toString() !== req.user.userId) {
        throw new AuthenticationError("Non autorisé à modifier cet outil");
      }

      // Vérifier si l'outil peut être modifié
      if (tool.status === "rented") {
        throw new ValidationError(
          "Impossible de modifier un outil en cours de location"
        );
      }

      // Conversion explicite des champs numériques
      if (req.body.dailyPrice)
        req.body.dailyPrice = Number(req.body.dailyPrice);
      if (req.body.price) req.body.price = Number(req.body.price);

      const updates = req.body as Partial<ToolData>;

      // Validation des mises à jour
      if (updates.name && updates.name.length < 3) {
        throw new ValidationError("Le nom doit contenir au moins 3 caractères");
      }

      if (updates.description) {
        if (
          updates.description.length < MIN_DESCRIPTION_LENGTH ||
          updates.description.length > MAX_DESCRIPTION_LENGTH
        ) {
          throw new ValidationError(
            `La description doit contenir entre ${MIN_DESCRIPTION_LENGTH} et ${MAX_DESCRIPTION_LENGTH} caractères`
          );
        }
      }

      if (
        updates.category &&
        !VALID_CATEGORIES.includes(updates.category.toLowerCase())
      ) {
        throw new ValidationError("Catégorie invalide");
      }

      if (updates.dailyPrice) {
        if (updates.dailyPrice < MIN_PRICE || updates.dailyPrice > MAX_PRICE) {
          throw new ValidationError(
            `Le prix journalier doit être compris entre ${MIN_PRICE} et ${MAX_PRICE}`
          );
        }
      }

      if (updates.images && updates.images.length > MAX_IMAGES) {
        throw new ValidationError(
          `Le nombre maximum d'images est de ${MAX_IMAGES}`
        );
      }

      if (updates.availability) {
        const { startDate, endDate } = updates.availability;
        const now = new Date();
        if (startDate < now) {
          throw new ValidationError("La date de début doit être dans le futur");
        }
        if (startDate >= endDate) {
          throw new ValidationError(
            "La date de début doit être antérieure à la date de fin"
          );
        }
      }

      if (updates.location) {
        const { coordinates } = updates.location;
        if (
          !coordinates ||
          coordinates.length !== 2 ||
          coordinates[0] < -180 ||
          coordinates[0] > 180 ||
          coordinates[1] < -90 ||
          coordinates[1] > 90
        ) {
          throw new ValidationError("Coordonnées géographiques invalides");
        }
      }

      const updatedTool = await Tool.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).populate("owner", "firstName lastName email");

      if (!updatedTool) {
        throw new DatabaseError("Erreur lors de la mise à jour de l'outil");
      }

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "tool_updated",
        "Outil mis à jour"
      );

      const response: ToolResponse = {
        message: "Outil mis à jour avec succès",
        tool: updatedTool,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Supprimer un outil
  async deleteTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const { id } = req.params;
      if (!id || !Types.ObjectId.isValid(id)) {
        throw new ValidationError("ID d'outil invalide");
      }

      const tool = await Tool.findById(id);
      if (!tool) {
        throw new DatabaseError("Outil non trouvé");
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (tool.owner.toString() !== req.user.userId) {
        throw new AuthenticationError("Non autorisé à supprimer cet outil");
      }

      // Vérifier si l'outil peut être supprimé
      if (tool.status === "rented") {
        throw new ValidationError(
          "Impossible de supprimer un outil en cours de location"
        );
      }

      await Tool.deleteOne({ _id: id });

      // Journalisation de l'événement
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "tool_deleted",
        "Outil supprimé"
      );

      const response: ToolResponse = {
        message: "Outil supprimé avec succès",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Obtenir les outils d'un utilisateur
  async getUserTools(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      const tools = await Tool.find({ owner: req.user.userId })
        .populate("reviews")
        .sort({ createdAt: -1 });

      const response: ToolResponse = {
        message: "Outils récupérés avec succès",
        tools,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
