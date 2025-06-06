/**
 * Interface pour les données du formulaire d'ajout d'outil
 */
export interface AddToolFormData {
  /** Nom de l'outil */
  name: string;
  /** Marque de l'outil */
  brand: string;
  /** Modèle de l'outil */
  model: string;
  /** Description de l'outil */
  description: string;
  /** Prix de location par jour */
  price: number;
  /** Localisation de l'outil */
  location: string;
  /** Catégorie de l'outil */
  category: string;
  /** Images de l'outil */
  images: File[];
  /** État de l'outil */
  etat: string;
  /** Indique si l'outil est assuré */
  isInsured: boolean;
  /** Dépôt de garantie (caution), en FCFA */
  caution?: number;
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
