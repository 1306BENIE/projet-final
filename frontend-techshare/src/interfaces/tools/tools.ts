import type { Tool } from "./tool";

/**
 * Interface pour les props du composant ToolsFilter
 */
export interface ToolsFilterProps {
  /** Valeur de la recherche */
  search: string;
  /** Fonction pour mettre à jour la recherche */
  setSearch: (value: string) => void;
  /** Valeur de la localisation */
  location: string;
  /** Fonction pour mettre à jour la localisation */
  setLocation: (value: string) => void;
  /** Prix minimum */
  minPrice: number;
  /** Fonction pour mettre à jour le prix minimum */
  setMinPrice: (value: number) => void;
  /** Prix maximum */
  maxPrice: number;
  /** Fonction pour mettre à jour le prix maximum */
  setMaxPrice: (value: number) => void;
  /** Statut de l'outil */
  status: string;
  /** Fonction pour mettre à jour le statut */
  setStatus: (value: string) => void;
  /** Fonction pour réinitialiser tous les filtres */
  resetFilters: () => void;
  /** Nombre de résultats trouvés */
  resultsCount: number;
}

/**
 * Interface pour les props du composant ToolsGrid
 */
export interface ToolsGridProps {
  /** État de chargement */
  loading: boolean;
  /** Liste des outils à afficher */
  tools: Tool[];
}

/**
 * Interface pour les props du composant ToolCard
 */
export interface ToolCardProps {
  /** Données de l'outil à afficher */
  tool: Tool;
  /** Index de l'outil dans la liste (pour l'animation) */
  index: number;
}
