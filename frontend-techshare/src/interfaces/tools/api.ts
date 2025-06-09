import type { Tool } from "./tool";

export interface ApiToolData {
  _id: string;
  name: string;
  brand: string;
  modelName: string;
  description: string;
  category: string;
  etat: string;
  dailyPrice: number;
  caution: number;
  isInsured: boolean;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: string;
  };
  images: string[];
  status: "available" | "rented" | "maintenance";
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string;
  rating?: number;
  rentalCount?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  tool: T;
}

export interface ApiToolsResponse {
  message: string;
  tools: ApiToolData[];
  total: number;
  page: number;
  limit: number;
}

export const convertApiToolToTool = (apiTool: ApiToolData): Tool => {
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

  return tool;
};
