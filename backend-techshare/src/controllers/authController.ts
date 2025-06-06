import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import jwt, { SignOptions } from "jsonwebtoken";
import { PasswordEncoder } from "../utils/password-encoder";
import { emailService } from "../services/emailService";
import { securityLogService } from "../services/securityLogService";
import { ValidationError, AuthenticationError } from "../utils/errors";
import { Types } from "mongoose";

// Interface pour les réponses d'API
interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Interface pour les données d'adresse
interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface pour les données d'inscription
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
}

// Interface pour les données de connexion
interface LoginData {
  email: string;
  password: string;
}

// Vérification de la clé secrète JWT
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Configuration JWT
const JWT_CONFIG: SignOptions = {
  expiresIn: 24 * 60 * 60, // 24 heures en secondes
  algorithm: "HS256",
  audience: "techshare-api",
  issuer: "techshare",
};

export const authController = {
  // Register a new user
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, address } =
        req.body as RegisterData;

      // Validation des champs requis
      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !phone ||
        !address
      ) {
        throw new ValidationError("Tous les champs sont requis", [
          { field: "email", message: "L'email est requis" },
          { field: "password", message: "Le mot de passe est requis" },
          { field: "firstName", message: "Le prénom est requis" },
          { field: "lastName", message: "Le nom est requis" },
          { field: "phone", message: "Le téléphone est requis" },
          { field: "address", message: "L'adresse est requise" },
        ]);
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError("Format d'email invalide");
      }

      // Validation du numéro de téléphone
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        throw new ValidationError("Format de numéro de téléphone invalide");
      }

      // Validation de l'adresse
      if (
        !address.street ||
        !address.city ||
        !address.postalCode ||
        !address.country
      ) {
        throw new ValidationError("Tous les champs de l'adresse sont requis", [
          { field: "address.street", message: "La rue est requise" },
          { field: "address.city", message: "La ville est requise" },
          { field: "address.postalCode", message: "Le code postal est requis" },
          { field: "address.country", message: "Le pays est requis" },
        ]);
      }

      // Vérification de l'existence de l'utilisateur
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ValidationError("Cet email est déjà utilisé");
      }

      // Validation du mot de passe
      const validation = PasswordEncoder.validatePassword(password);
      if (!validation.isValid) {
        throw new ValidationError(
          "Mot de passe invalide",
          validation.errors.map((error) => ({
            field: "password",
            message: error,
          }))
        );
      }

      // Création du nouvel utilisateur
      const user = new User({
        email: email.toLowerCase().trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode.trim(),
          country: address.country.trim(),
        },
        role: "user",
      });

      // Sauvegarde de l'utilisateur
      await user.save();

      // Génération du token JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        JWT_CONFIG
      );

      // Journalisation de l'événement
      await securityLogService.logEvent(
        user._id,
        "register",
        "Inscription réussie"
      );

      // Envoi d'un email de confirmation
      await emailService.sendWelcomeEmail(user);

      // Réponse de succès
      const response: AuthResponse = {
        message: "Inscription réussie",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginData;

      if (!email || !password) {
        throw new ValidationError("Email et mot de passe requis");
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        throw new AuthenticationError("Identifiants invalides");
      }

      // Verify password using the model's method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Journalisation de la tentative échouée
        await securityLogService.logEvent(
          user._id,
          "login_failed",
          "Tentative de connexion échouée"
        );
        throw new AuthenticationError("Identifiants invalides");
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        JWT_CONFIG
      );

      // Journalisation de l'événement
      await securityLogService.logEvent(user._id, "login", "Connexion réussie");

      // Réponse de succès
      const response: AuthResponse = {
        message: "Connexion réussie",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError("Non autorisé");
      }

      // Journalisation de la déconnexion
      await securityLogService.logEvent(
        new Types.ObjectId(req.user.userId),
        "logout",
        "Déconnexion réussie"
      );

      const response: AuthResponse = {
        message: "Déconnexion réussie",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
