import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { IAdmin } from "../interfaces/admin.interface";

const adminSchema = new Schema<IAdmin>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est requis"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator"],
      required: [true, "Le rôle est requis"],
    },
    permissions: [
      {
        type: String,
        required: [true, "Les permissions sont requises"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche rapide
adminSchema.index({ user: 1, role: 1 });

// Middleware pour logger les opérations
adminSchema.pre(
  "save",
  function (
    this: IAdmin,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Sauvegarde d'un administrateur", {
      adminId: this._id,
      userId: this.user,
      role: this.role,
      permissions: this.permissions,
    });
    next();
  }
);

adminSchema.pre(
  "deleteOne",
  function (
    this: IAdmin,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Suppression d'un administrateur", {
      adminId: this._id,
      userId: this.user,
      role: this.role,
    });
    next();
  }
);

const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export { Admin };
