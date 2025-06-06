import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { ICategory } from "../interfaces/category.interface";

const categorySchema = new Schema<ICategory>(
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
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche rapide
categorySchema.index({ slug: 1 });
categorySchema.index({ name: "text" });

// Middleware pour logger les opérations
categorySchema.pre(
  "save",
  function (
    this: ICategory,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Sauvegarde d'une catégorie", {
      categoryId: this._id,
      name: this.name,
      slug: this.slug,
    });
    next();
  }
);

categorySchema.pre(
  "deleteOne",
  function (
    this: ICategory,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Suppression d'une catégorie", {
      categoryId: this._id,
      name: this.name,
      slug: this.slug,
    });
    next();
  }
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export { Category };
