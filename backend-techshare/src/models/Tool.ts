import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { ITool } from "../interfaces/tool.interface";

const toolSchema = new Schema<ITool>(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "La catégorie est requise"],
    },
    price: {
      type: Number,
      required: [true, "Le prix est requis"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    dailyPrice: {
      type: Number,
      required: [true, "Le prix journalier est requis"],
      min: [0, "Le prix journalier ne peut pas être négatif"],
    },
    deposit: {
      type: Number,
      required: [true, "La caution est requise"],
      min: [0, "La caution ne peut pas être négative"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le propriétaire est requis"],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    rating: {
      type: Number,
      min: [0, "La note minimale est de 0"],
      max: [5, "La note maximale est de 5"],
      default: 0,
    },
    rentalCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: [true, "L'utilisateur est requis"],
        },
        rating: {
          type: Number,
          required: [true, "La note est requise"],
          min: [0, "La note minimale est de 0"],
          max: [5, "La note maximale est de 5"],
        },
        comment: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche géospatiale
toolSchema.index({ location: "2dsphere" });

// Middleware pour logger les opérations
toolSchema.pre(
  "save",
  function (this: ITool, next: mongoose.CallbackWithoutResultAndOptionalError) {
    logger.debug("Sauvegarde d'un outil", {
      toolId: this._id,
      name: this.name,
      owner: this.owner,
      status: this.status,
    });
    next();
  }
);

toolSchema.pre(
  "deleteOne",
  function (this: ITool, next: mongoose.CallbackWithoutResultAndOptionalError) {
    logger.debug("Suppression d'un outil", {
      toolId: this._id,
      name: this.name,
      owner: this.owner,
    });
    next();
  }
);

const Tool = mongoose.model<ITool>("Tool", toolSchema);
export { Tool };
