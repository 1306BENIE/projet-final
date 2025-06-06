import { Document } from "mongoose";

/**
 * Interface représentant une catégorie d'outils dans l'application
 */
export interface ICategory extends Document {
  /** Nom de la catégorie */
  name: string;
  /** Description de la catégorie */
  description: string;
  /** Slug URL-friendly */
  slug: string;
  /** Icône de la catégorie (optionnel) */
  icon?: string;
  /** Indique si la catégorie est active */
  isActive: boolean;
  /** Date de création */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt: Date;
}
