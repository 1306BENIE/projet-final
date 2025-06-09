import type { Tool } from "./tool";

export interface ApiToolResponse {
  _id: string;
  name: string;
  brand: string;
  modelName: string;
  description: string;
  category:
    | "bricolage"
    | "jardinage"
    | "nettoyage"
    | "cuisine"
    | "informatique"
    | "autre";
  etat: "neuf" | "bon_etat" | "usage";
  dailyPrice: number;
  caution: number;
  address: string;
  images: string[];
  status: "available" | "rented" | "maintenance";
  rating?: number;
  isInsured: boolean;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  tools?: ApiToolResponse[];
  tool?: ApiToolResponse;
}

export const convertApiToolToTool = (apiTool: ApiToolResponse): Tool => {
  if (!apiTool) {
    throw new Error("Données de l'outil manquantes");
  }

  if (!apiTool._id) {
    throw new Error("ID de l'outil manquant");
  }

  console.log("Converting API tool:", apiTool);

  const tool: Tool = {
    id: apiTool._id,
    name: apiTool.name,
    brand: apiTool.brand,
    model: apiTool.modelName,
    description: apiTool.description,
    category: apiTool.category,
    etat: apiTool.etat,
    dailyPrice: apiTool.dailyPrice,
    caution: apiTool.caution,
    address: apiTool.address,
    location: {
      type: "Point",
      coordinates: [0, 0], // Valeur par défaut, à ajuster selon vos besoins
    },
    images: apiTool.images || [],
    status: apiTool.status,
    rating: apiTool.rating,
    isInsured: apiTool.isInsured,
    owner: {
      id: apiTool.owner._id,
      firstName: apiTool.owner.firstName,
      lastName: apiTool.owner.lastName,
    },
    createdAt: apiTool.createdAt,
    updatedAt: apiTool.updatedAt,
  };

  return tool;
};
