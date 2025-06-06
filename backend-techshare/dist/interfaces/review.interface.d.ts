import { Document, Types } from "mongoose";
/**
 * Interface représentant un avis dans l'application
 */
export interface IReview extends Document {
    /** Identifiant de l'utilisateur ayant laissé l'avis */
    user: Types.ObjectId;
    /** Identifiant de l'outil concerné */
    tool: Types.ObjectId;
    /** Identifiant de la location concernée */
    rental: Types.ObjectId;
    /** Note attribuée (entre 1 et 5) */
    rating: number;
    /** Commentaire de l'avis */
    comment: string;
    /** Date de création */
    createdAt: Date;
    /** Date de dernière modification */
    updatedAt: Date;
}
