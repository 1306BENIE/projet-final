import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { ValidationError, AuthenticationError } from "../utils/errors";
import { emailService } from "../services/emailService";

export const userController = {
  // Register a new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ValidationError("Cet email est déjà utilisé");
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        role: "user",
      });

      await user.save();

      // Send welcome email if email service is configured
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (error) {
        logger.warn("Impossible d'envoyer l'email de bienvenue:", error);
      }

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Email ou mot de passe incorrect");
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AuthenticationError("Email ou mot de passe incorrect");
      }

      // Generate token
      const token = user.generateAuthToken();

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user) {
        throw new ValidationError("Utilisateur non trouvé");
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?.userId);

      if (!user) {
        throw new ValidationError("Utilisateur non trouvé");
      }

      // Update basic info
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      // Update password if provided
      if (currentPassword && newPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          throw new ValidationError("Mot de passe actuel incorrect");
        }
        user.password = newPassword;
      }

      await user.save();

      res.json({
        message: "Profil mis à jour avec succès",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const user = await User.findById(req.user?.userId);

      if (!user) {
        throw new ValidationError("Utilisateur non trouvé");
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ValidationError("Mot de passe incorrect");
      }

      await user.deleteOne();

      res.json({ message: "Compte supprimé avec succès" });
    } catch (error) {
      next(error);
    }
  },

  // Get all users (admin only)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find()
          .select("-password")
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(),
      ]);

      res.json({
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Request password reset
  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        throw new ValidationError("Aucun compte associé à cet email");
      }

      const resetToken = await user.generatePasswordResetToken();
      await user.save();

      // Send reset email if email service is configured
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
      } catch (error) {
        logger.warn("Impossible d'envoyer l'email de réinitialisation:", error);
        // Continue with the response even if email fails
      }

      res.json({ message: "Email de réinitialisation envoyé" });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new ValidationError("Token invalide ou expiré");
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      next(error);
    }
  },
};
