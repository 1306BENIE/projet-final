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
    avatar: string;
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
  reviewsCount: number;
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
function transformToolData(apiTool: ApiToolData): Tool {
  const transformedTool: Tool = {
    id: apiTool._id,
    name: apiTool.name,
    brand: apiTool.brand,
    model: apiTool.modelName,
    description: apiTool.description,
    category: apiTool.category,
    etat: apiTool.etat,
    dailyPrice: apiTool.dailyPrice,
    caution: apiTool.caution,
    isInsured: apiTool.isInsured,
    owner: {
      id: apiTool.owner._id,
      firstName: apiTool.owner.firstName,
      lastName: apiTool.owner.lastName,
      email: apiTool.owner.email,
      avatar: apiTool.owner.avatar,
    },
    images: apiTool.images,
    status: apiTool.status,
    location: {
      type: "Point",
      coordinates: [
        apiTool.location.coordinates[0],
        apiTool.location.coordinates[1],
      ] as [number, number],
    },
    address: apiTool.address,
    rating: apiTool.rating || 0,
    rentalCount: apiTool.rentalCount || 0,
    createdAt: apiTool.createdAt,
    updatedAt: apiTool.updatedAt,
  };

  return transformedTool;
}

export const toolService = {
  /**
   * Crée un nouvel outil
   */
  async createTool(data: FormData): Promise<Tool> {
    try {
      const response = await api.post<ApiResponse<ApiToolData>>(
        "/tools",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return transformToolData(response.data.tool);
    } catch (error) {
      console.error("Error creating tool:", error);
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

      const transformedTools = response.data.tools.map(transformToolData);
      return transformedTools;
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
      throw new Error("ID d'outil manquant");
    }

    try {
      console.log("Fetching tool with ID:", id);
      const response = await api.get<ApiResponse<ApiToolData>>(`/tools/${id}`);

      if (!response.data || !response.data.tool) {
        throw new Error("Données d'outil manquantes dans la réponse");
      }

      return transformToolData(response.data.tool);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'outil:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Outil non trouvé");
        }
        if (error.response?.status === 400) {
          throw new Error("Format d'ID invalide");
        }
        if (error.response?.status === 500) {
          throw new Error("Erreur serveur lors de la récupération de l'outil");
        }
      }

      throw new Error("Erreur lors de la récupération de l'outil");
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
  async updateTool(id: string, data: FormData): Promise<Tool> {
    try {
      const response = await api.put<ApiResponse<ApiToolData>>(
        `/tools/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return transformToolData(response.data.tool);
    } catch (error) {
      console.error("Error updating tool:", error);
      throw error;
    }
  },
};
