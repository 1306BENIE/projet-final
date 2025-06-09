/**
 * Interface représentant le propriétaire d'un outil
 */
export interface Owner {
  /** Nom du propriétaire */
  name: string;
  /** URL de l'avatar du propriétaire */
  avatar: string;
  /** Email du propriétaire */
  email?: string;
}

/**
 * Interface représentant un outil technologique disponible à la location
 */
export interface Tool {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  etat: string;
  dailyPrice: number;
  caution: number;
  isInsured: boolean;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  images: string[];
  status: "available" | "unavailable";
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string;
  rating: number;
  rentalCount: number;
  createdAt: string;
  updatedAt: string;
}
