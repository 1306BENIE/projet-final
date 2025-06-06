import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { IReview } from "../interfaces/review.interface";

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est requis"],
    },
    tool: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: [true, "L'outil est requis"],
    },
    rental: {
      type: Schema.Types.ObjectId,
      ref: "Rental",
      required: [true, "La location est requise"],
    },
    rating: {
      type: Number,
      required: [true, "La note est requise"],
      min: [1, "La note minimale est de 1"],
      max: [5, "La note maximale est de 5"],
    },
    comment: {
      type: String,
      required: [true, "Le commentaire est requis"],
      trim: true,
      minlength: [10, "Le commentaire doit contenir au moins 10 caractères"],
      maxlength: [500, "Le commentaire ne doit pas dépasser 500 caractères"],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour éviter les doublons d'avis
reviewSchema.index({ user: 1, rental: 1 }, { unique: true });

// Middleware pour logger les opérations
reviewSchema.pre(
  "save",
  function (
    this: IReview,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Sauvegarde d'un avis", {
      reviewId: this._id,
      userId: this.user,
      toolId: this.tool,
      rentalId: this.rental,
    });
    next();
  }
);

reviewSchema.pre(
  "deleteOne",
  function (
    this: IReview,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Suppression d'un avis", {
      reviewId: this._id,
      userId: this.user,
      toolId: this.tool,
      rentalId: this.rental,
    });
    next();
  }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);
export { Review };
