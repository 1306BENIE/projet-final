import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IUser, IUserMethods } from "../interfaces/user.interface";

// Interface pour le modèle
export interface UserModel extends Model<IUser, {}, IUserMethods> {}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    stripeCustomerId: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isBanned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Méthode pour générer le token JWT
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { userId: this._id.toString() },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

// Méthode pour générer le token de réinitialisation
userSchema.methods.generatePasswordResetToken =
  async function (): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 heure
    await this.save();
    return token;
  };

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Index pour la recherche géospatiale
userSchema.index({ location: "2dsphere" });

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
