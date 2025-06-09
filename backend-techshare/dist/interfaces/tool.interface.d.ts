import { Document, Types } from "mongoose";
/**
 * Interface représentant un outil dans l'application
 */
export interface ITool extends Document {
    /** Nom de l'outil */
    name: string;
    /** Marque de l'outil */
    brand: string;
    /** Modèle de l'outil */
    modelName: string;
    /** Description détaillée */
    description: string;
    /** Catégorie de l'outil */
    category: "bricolage" | "jardinage" | "nettoyage" | "cuisine" | "informatique" | "autre";
    /** État de l'outil */
    etat: "neuf" | "bon_etat" | "usage";
    /** Prix de location journalier */
    dailyPrice: number;
    /** Montant de la caution */
    caution: number;
    /** Indique si l'outil est assuré */
    isInsured: boolean;
    /** Identifiant du propriétaire */
    owner: Types.ObjectId;
    /** Liste des URLs des images */
    images: string[];
    /** État de l'outil */
    status: "available" | "rented" | "maintenance";
    /** Position géographique (GeoJSON strict) */
    location: {
        type: "Point";
        coordinates: number[];
    };
    /** Adresse séparée */
    address: string;
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
