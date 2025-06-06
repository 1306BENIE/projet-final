import type { Tool } from "@/interfaces/tools/tool";

/**
 * Service pour gérer les opérations liées aux outils (100% localStorage)
 */
export const toolService = {
  /**
   * Crée un nouvel outil
   */
  createTool: async (formData: FormData): Promise<Tool> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const tools: Tool[] = JSON.parse(localStorage.getItem("tools") || "[]");

    // Convertir les images en URLs
    const imageUrls = await Promise.all(
      Array.from(formData.getAll("images")).map(async (file) => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        return file;
      })
    );

    const newTool: Tool = {
      id: Date.now(),
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      priceValue: Number(
        (formData.get("price") as string).replace(/[^\d]/g, "")
      ),
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      image: imageUrls[0],
      images: imageUrls,
      etat: formData.get("etat") as string,
      isInsured: formData.get("isInsured") === "true",
      caution: formData.get("caution")
        ? Number(formData.get("caution"))
        : undefined,
      status: "available",
      rating: 0,
      reviewsCount: 0,
      rentalCount: 0,
      isNew: true,
      owner: {
        name: user.email,
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      },
    };

    tools.push(newTool);
    localStorage.setItem("tools", JSON.stringify(tools));
    return newTool;
  },

  /**
   * Récupère la liste des outils depuis le localStorage
   */
  getTools: async (): Promise<Tool[]> => {
    return JSON.parse(localStorage.getItem("tools") || "[]");
  },

  /**
   * Récupère un outil par son ID depuis le localStorage
   */
  getToolById: async (id: string): Promise<Tool | undefined> => {
    const tools: Tool[] = JSON.parse(localStorage.getItem("tools") || "[]");
    return tools.find((t) => String(t.id) === String(id));
  },

  /**
   * Récupère les outils d'un utilisateur spécifique
   */
  getUserTools: async (): Promise<Tool[]> => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const tools: Tool[] = JSON.parse(localStorage.getItem("tools") || "[]");
    return tools.filter((tool) => tool.owner?.name === user.email);
  },

  /**
   * Supprime un outil
   */
  deleteTool: async (id: string): Promise<void> => {
    const tools: Tool[] = JSON.parse(localStorage.getItem("tools") || "[]");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // Vérifier si l'utilisateur est le propriétaire de l'outil
    const tool = tools.find((t) => String(t.id) === String(id));
    if (!tool || tool.owner?.name !== user.email) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cet outil");
    }

    const updatedTools = tools.filter((t) => String(t.id) !== String(id));
    localStorage.setItem("tools", JSON.stringify(updatedTools));
  },

  /**
   * Met à jour un outil
   */
  updateTool: async (id: string, formData: FormData): Promise<Tool> => {
    const tools: Tool[] = JSON.parse(localStorage.getItem("tools") || "[]");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // Vérifier si l'utilisateur est le propriétaire de l'outil
    const toolIndex = tools.findIndex((t) => String(t.id) === String(id));
    if (toolIndex === -1 || tools[toolIndex].owner?.name !== user.email) {
      throw new Error("Vous n'êtes pas autorisé à modifier cet outil");
    }

    // Convertir les images en URLs si de nouvelles images sont fournies
    let imageUrls = tools[toolIndex].images;
    if (formData.getAll("images").length > 0) {
      imageUrls = await Promise.all(
        Array.from(formData.getAll("images")).map(async (file) => {
          if (file instanceof File) {
            return URL.createObjectURL(file);
          }
          return file;
        })
      );
    }

    const updatedTool: Tool = {
      ...tools[toolIndex],
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      priceValue: Number(
        (formData.get("price") as string).replace(/[^\d]/g, "")
      ),
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      image: imageUrls[0],
      images: imageUrls,
      etat: formData.get("etat") as string,
      isInsured: formData.get("isInsured") === "true",
      caution: formData.get("caution")
        ? Number(formData.get("caution"))
        : undefined,
    };

    tools[toolIndex] = updatedTool;
    localStorage.setItem("tools", JSON.stringify(tools));
    return updatedTool;
  },
};
