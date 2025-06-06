import { Document, Types } from "mongoose";
/**
 * Interface représentant un outil dans l'application
 */
export interface ITool extends Document {
    /** Nom de l'outil */
    name: string;
    /** Description détaillée */
    description: string;
    /** Catégorie de l'outil */
    category: string;
    /** Prix de vente */
    price: number;
    /** Prix de location journalier */
    dailyPrice: number;
    /** Montant de la caution */
    deposit: number;
    /** Identifiant du propriétaire */
    owner: Types.ObjectId;
    /** Liste des URLs des images */
    images: string[];
    /** État de l'outil */
    status: "available" | "rented" | "maintenance";
    /** Position géographique */
    location: {
        /** Type de géométrie (Point) */
        type: string;
        /** Coordonnées [longitude, latitude] */
        coordinates: number[];
    };
    /** Note moyenne */
    rating: number;
    /** Nombre total de locations */
    rentalCount: number;
    /** Liste des avis */
    reviews: Array<{
        /** Identifiant de l'utilisateur */
        user: Types.ObjectId;
        /** Note attribuée */
        rating: number;
        /** Commentaire optionnel */
        comment?: string;
        /** Date de l'avis */
        date: Date;
    }>;
    /** Date de création */
    createdAt: Date;
    /** Date de dernière modification */
    updatedAt: Date;
}
