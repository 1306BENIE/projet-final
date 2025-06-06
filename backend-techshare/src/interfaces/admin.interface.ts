import { Document, Types } from "mongoose";

/**
 * Interface représentant un administrateur dans l'application
 */
export interface IAdmin extends Document {
  /** Identifiant de l'utilisateur administrateur */
  user: Types.ObjectId;
  /** Rôle de l'administrateur */
  role: "super_admin" | "moderator";
  /** Liste des permissions */
  permissions: string[];
  /** Date de création */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt: Date;
}
