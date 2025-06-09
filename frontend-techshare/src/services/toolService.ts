import type { Tool } from "@/interfaces/tools/tool";
import api from "@/services/api";
import axios from "axios";

// Interface pour les données de l'API
interface ApiToolData {
  _id: string;
  name: string;
  brand: string;
  modelName: string;
  description: string;
  category: Tool["category"];
  etat: Tool["etat"];
  dailyPrice: number;
  caution: number;
  isInsured: boolean;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  images: string[];
  status: Tool["status"];
  location: {
    type: "Point";
    coordinates: number[];
  };
  address: string;
  rating: number;
  rentalCount: number;
  reviews: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    rating: number;
    comment?: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Interface pour la réponse de l'API
interface ApiResponse<T> {
  message: string;
  tool: T;
}

// Interface pour la réponse de la liste des outils
interface ApiToolsResponse {
  message: string;
  tools: ApiToolData[];
}

// Fonction pour transformer les données de l'API
const transformToolData = (data: ApiToolData): Tool => {
  console.log("Données reçues de l'API:", data);

  if (!data) {
    throw new Error("Données d'outil manquantes");
  }

  if (!data._id) {
    throw new Error("ID d'outil manquant dans les données");
  }

  const transformedTool = {
    id: data._id,
    name: data.name,
    brand: data.brand,
    model: data.modelName,
    description: data.description,
    category: data.category,
    etat: data.etat,
    dailyPrice: data.dailyPrice,
    caution: data.caution,
    isInsured: data.isInsured,
    owner: {
      id: data.owner._id,
      firstName: data.owner.firstName,
      lastName: data.owner.lastName,
    },
    images: data.images,
    status: data.status,
    location: {
      type: "Point" as const,
      coordinates: [
        data.location.coordinates[0],
        data.location.coordinates[1],
      ] as [number, number],
    },
    address: data.address,
    rating: data.rating,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  console.log("Outil transformé:", transformedTool);
  return transformedTool;
};

export const toolService = {
  /**
   * Crée un nouvel outil
   */
  async createTool(
    toolData: Omit<Tool, "id" | "createdAt" | "updatedAt">
  ): Promise<Tool> {
    try {
      const response = await api.post<ApiResponse<ApiToolData>>(
        "/tools",
        toolData
      );
      return transformToolData(response.data.tool);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la création de l'outil"
        );
      }
      throw error;
    }
  },

  /**
   * Récupère la liste des outils depuis l'API
   */
  async getTools(): Promise<Tool[]> {
    try {
      const response = await api.get<ApiToolsResponse>("/tools");
      if (!response.data || !response.data.tools) {
        throw new Error("Format de réponse invalide");
      }
      return response.data.tools.map(transformToolData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la récupération des outils"
        );
      }
      throw error;
    }
  },

  /**
   * Récupère un outil par son ID depuis l'API
   */
  async getToolById(id: string): Promise<Tool> {
    if (!id) {
      throw new Error("ID de l'outil manquant");
    }

    try {
      const response = await api.get<ApiResponse<ApiToolData>>(`/tools/${id}`);
      console.log("Réponse de l'API:", response.data);

      if (!response.data) {
        throw new Error("Aucune donnée reçue de l'API");
      }

      // Gérer les deux formats de réponse possibles
      const toolData = response.data.tool || response.data;
      return transformToolData(toolData);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'outil:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Outil non trouvé");
        }
        if (error.response?.status === 400) {
          throw new Error(
            error.response.data.message || "Format d'ID invalide"
          );
        }
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la récupération de l'outil"
        );
      }
      throw error;
    }
  },

  /**
   * Récupère les outils d'un utilisateur spécifique
   */
  async getUserTools(): Promise<Tool[]> {
    const response = await api.get("/tools/user");
    if (!response.data || !response.data.tools) {
      throw new Error("Format de réponse invalide");
    }
    return response.data.tools.map(transformToolData);
  },

  /**
   * Supprime un outil
   */
  async deleteTool(id: string): Promise<void> {
    try {
      await api.delete(`/tools/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la suppression de l'outil"
        );
      }
      throw error;
    }
  },

  /**
   * Met à jour un outil
   */
  async updateTool(id: string, toolData: Partial<Tool>): Promise<Tool> {
    try {
      const response = await api.put<ApiResponse<ApiToolData>>(
        `/tools/${id}`,
        toolData
      );
      return transformToolData(response.data.tool);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la mise à jour de l'outil"
        );
      }
      throw error;
    }
  },
};
