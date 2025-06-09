/**
 * Interface pour les données du formulaire d'ajout d'outil
 */
export interface AddToolFormData {
  /** Nom de l'outil */
  name: string;
  /** Marque de l'outil */
  brand: string;
  /** Modèle de l'outil */
  modelName: string;
  /** Description de l'outil */
  description: string;
  /** Catégorie de l'outil */
  category:
    | "bricolage"
    | "jardinage"
    | "nettoyage"
    | "cuisine"
    | "informatique"
    | "autre";
  /** État de l'outil */
  etat: "neuf" | "bon_etat" | "usage";
  /** Prix de location par jour */
  dailyPrice: number;
  /** Dépôt de garantie (caution), en FCFA */
  caution: number;
  /** Indique si l'outil est assuré */
  isInsured: boolean;
  /** Localisation de l'outil */
  location: {
    address: string;
    coordinates: [number, number];
  };
  /** Images de l'outil */
  images: File[];
}

/**
 * Interface pour les props du composant AddTool
 */
export interface AddToolProps {
  /** Fonction appelée lors de la soumission du formulaire */
  onSubmit: (data: FormData) => void;
  /** État de chargement */
  loading?: boolean;
}

export interface FormDataState {
  name?: string;
  brand?: string;
  modelName?: string;
  category?: string;
  etat?: string;
  description?: string;
  dailyPrice?: string;
  caution?: string;
  location?: string;
  isInsured?: string;
  images?: FileList;
}

export interface ValidationState {
  name: boolean | null;
  brand: boolean | null;
  modelName: boolean | null;
  category: boolean | null;
  etat: boolean | null;
  description: boolean | null;
  dailyPrice: boolean | null;
  caution: boolean | null;
  location: boolean | null;
  isInsured: boolean | null;
  images: boolean | null;
}
