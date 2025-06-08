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
  isInsured: boolean;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string;
  rating?: number;
  images: string[];
  status: "available" | "rented" | "maintenance";
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
