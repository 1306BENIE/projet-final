import { Document, Types } from "mongoose";

/**
 * Interface représentant une notification dans l'application
 */
export interface INotification extends Document {
  /** Identifiant du destinataire */
  recipient: Types.ObjectId;
  /** Identifiant de l'expéditeur (optionnel) */
  sender?: Types.ObjectId;
  /** Type de notification */
  type:
    | "rental_request" // Demande de location
    | "rental_accepted" // Location acceptée
    | "rental_rejected" // Location refusée
    | "rental_completed" // Location terminée
    | "review_received" // Avis reçu
    | "payment_received" // Paiement reçu
    | "system"; // Notification système
  /** Titre de la notification */
  title: string;
  /** Message de la notification */
  message: string;
  /** Identifiant de l'outil concerné (optionnel) */
  relatedTool?: Types.ObjectId;
  /** Identifiant de la location concernée (optionnel) */
  relatedRental?: Types.ObjectId;
  /** Indique si la notification a été lue */
  isRead: boolean;
  /** Date de création */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt: Date;
}
