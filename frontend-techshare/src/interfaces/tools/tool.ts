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
  // Champs obligatoires
  /** Identifiant unique de l'outil */
  id: number;
  /** Nom de l'outil */
  name: string;
  /** Marque de l'outil */
  brand: string;
  /** Modèle de l'outil */
  model: string;
  /** Description détaillée de l'outil */
  description: string;
  /** Prix de location formaté (ex: "15,000 FCFA") */
  price: string;
  /** Valeur numérique du prix pour les calculs */
  priceValue: number;
  /** Localisation de l'outil */
  location: string;
  /** Statut de disponibilité ("available" | "unavailable") */
  status: string;
  /** URL de l'image principale de l'outil */
  image: string;
  /** Liste des URLs des images de l'outil */
  images: string[];
  /** État de l'outil */
  etat: string;

  // Champs optionnels
  /** Indique si l'outil est nouveau */
  isNew?: boolean;
  /** Catégorie de l'outil (ex: "Ordinateur", "Tablette", "Drone") */
  category?: string;
  /** Note moyenne sur 5 */
  rating?: number;
  /** Nombre total d'avis */
  reviewsCount?: number;
  /** Informations sur le propriétaire */
  owner?: Owner;
  /** Nombre de fois que l'outil a été loué */
  rentalCount?: number;
  /** Indique si l'outil est assuré */
  isInsured?: boolean;
  /** Dépôt de garantie (caution), en FCFA */
  caution?: number;
}
