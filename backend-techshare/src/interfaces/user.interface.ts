import { Document, Types } from "mongoose";

/**
 * Interface de base pour les propriétés du document utilisateur
 */
export interface IUserBase {
  /** Email de l'utilisateur (unique) */
  email: string;
  /** Mot de passe hashé */
  password: string;
  /** Prénom de l'utilisateur */
  firstName: string;
  /** Nom de l'utilisateur */
  lastName: string;
  /** Numéro de téléphone */
  phone: string;
  /** Adresse postale */
  address: {
    /** Rue */
    street: string;
    /** Ville */
    city: string;
    /** Code postal */
    postalCode: string;
    /** Pays */
    country: string;
  };
  /** Position géographique */
  location: {
    /** Type de géométrie (Point) */
    type: string;
    /** Coordonnées [longitude, latitude] */
    coordinates: number[];
  };
  /** Rôle de l'utilisateur */
  role: "user" | "admin";
  /** Note moyenne de l'utilisateur */
  rating: number;
  /** Liste des identifiants des avis */
  reviews: Types.ObjectId[];
  /** Identifiant client Stripe */
  stripeCustomerId?: string;
  /** Token de réinitialisation du mot de passe */
  resetPasswordToken?: string;
  /** Date d'expiration du token de réinitialisation */
  resetPasswordExpires?: Date;
  /** Indique si l'utilisateur est banni */
  isBanned: boolean;
}

/**
 * Interface pour les méthodes d'instance de l'utilisateur
 */
export interface IUserMethods {
  /** Compare le mot de passe fourni avec le hash stocké */
  comparePassword(candidatePassword: string): Promise<boolean>;
  /** Génère un token de réinitialisation de mot de passe */
  generatePasswordResetToken(): Promise<string>;
  /** Génère un token JWT pour l'authentification */
  generateAuthToken(): string;
}

/**
 * Interface complète du document utilisateur
 */
export interface IUser extends Document, IUserBase, IUserMethods {}
