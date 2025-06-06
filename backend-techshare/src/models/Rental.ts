import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { IRental } from "../interfaces/rental.interface";

const rentalSchema = new Schema<IRental>(
  {
    tool: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: [true, "L'outil est requis"],
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le locataire est requis"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le propriétaire est requis"],
    },
    startDate: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    endDate: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: [true, "Le prix total est requis"],
      min: [0, "Le prix total ne peut pas être négatif"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Le message ne doit pas dépasser 500 caractères"],
    },
    review: {
      rating: {
        type: Number,
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
  },
  {
    timestamps: true,
  }
);

// Middleware pour logger les opérations
rentalSchema.pre(
  "save",
  function (
    this: IRental,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Sauvegarde d'une location", {
      rentalId: this._id,
      toolId: this.tool,
      renterId: this.renter,
      status: this.status,
    });
    next();
  }
);

rentalSchema.pre(
  "deleteOne",
  function (
    this: IRental,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Suppression d'une location", {
      rentalId: this._id,
      toolId: this.tool,
      renterId: this.renter,
    });
    next();
  }
);

const Rental = mongoose.model<IRental>("Rental", rentalSchema);
export { Rental };
