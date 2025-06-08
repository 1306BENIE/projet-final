import type { Tool } from "@/interfaces/tools/tool";

export const toolService = {
  /**
   * Crée un nouvel outil
   */
  createTool: async (formData: FormData): Promise<Tool> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = user?.token;
    if (!token) throw new Error("Utilisateur non authentifié");

    console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tools`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Erreur lors de la création de l'outil"
      );
    }
    return response.json();
  },

  /**
   * Récupère la liste des outils depuis l'API
   */
  getTools: async (): Promise<Tool[]> => {
    console.log(import.meta.env.VITE_API_URL);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tools`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des outils");
    }
    const data = await response.json();
    return data.tools || data.data || [];
  },

  /**
   * Récupère un outil par son ID depuis l'API
   */
  getToolById: async (id: string): Promise<Tool | undefined> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tools/${id}`);
    if (!response.ok) {
      throw new Error("Outil introuvable");
    }
    const data = await response.json();
    return data.tool || data.data;
  },

  /**
   * Récupère les outils d'un utilisateur spécifique
   */
  getUserTools: async (): Promise<Tool[]> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = user?.token;
    if (!token) throw new Error("Utilisateur non authentifié");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tools/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de vos outils");
    }
    const data = await response.json();
    return data.tools || data.data || [];
  },

  /**
   * Supprime un outil
   */
  deleteTool: async (id: string): Promise<void> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = user?.token;
    if (!token) throw new Error("Utilisateur non authentifié");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tools/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'outil");
    }
  },

  /**
   * Met à jour un outil
   */
  updateTool: async (id: string, formData: FormData): Promise<Tool> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = user?.token;
    if (!token) throw new Error("Utilisateur non authentifié");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tools/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de l'outil");
    }
    return response.json();
  },
};
