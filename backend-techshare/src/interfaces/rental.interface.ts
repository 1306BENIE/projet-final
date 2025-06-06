import { Document, Types } from "mongoose";

/**
 * Interface représentant une location dans l'application
 */
export interface IRental extends Document {
  /** Identifiant de l'outil loué */
  tool: Types.ObjectId;
  /** Identifiant du locataire */
  renter: Types.ObjectId;
  /** Identifiant du propriétaire */
  owner: Types.ObjectId;
  /** Date de début de location */
  startDate: Date;
  /** Date de fin de location */
  endDate: Date;
  /** Prix total de la location */
  totalPrice: number;
  /** État de la location */
  status:
    | "pending" // En attente de validation
    | "approved" // Acceptée par le propriétaire
    | "rejected" // Refusée par le propriétaire
    | "active" // En cours
    | "completed" // Terminée
    | "cancelled"; // Annulée
  /** État du paiement */
  paymentStatus: "pending" | "paid" | "refunded";
  /** Identifiant du paiement Stripe */
  stripePaymentId?: string;
  /** Identifiant du paiement Stripe */
  paymentIntentId?: string;
  /** Message optionnel pour la location */
  message?: string;
  /** Avis sur la location (optionnel) */
  review?: {
    /** Note attribuée */
    rating: number;
    /** Commentaire optionnel */
    comment?: string;
    /** Date de l'avis */
    date: Date;
  };
  /** Date de création */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt: Date;
}
