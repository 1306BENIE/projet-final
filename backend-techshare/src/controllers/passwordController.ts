import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { emailService } from "../services/emailService";
import { securityLogService } from "../services/securityLogService";
import { ValidationError } from "../utils/errors";
import { PasswordEncoder } from "../utils/password-encoder";
import crypto from "crypto";

// Interface pour les données de réinitialisation
interface ResetPasswordData {
  token: string;
  password: string;
}

// Interface pour les réponses d'API
interface PasswordResponse {
  message: string;
}

export const passwordController = {
  // Request password reset
  async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError("L'email est requis");
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Pour des raisons de sécurité, on renvoie toujours un succès
        const response: PasswordResponse = {
          message:
            "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
        };
        res.status(200).json(response);
        return;
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000); // 1 heure

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Envoyer l'email
      await emailService.sendPasswordResetEmail(user, resetToken);

      // Log the action
      await securityLogService.logEvent(
        user._id,
        "REQUEST_PASSWORD_RESET",
        "Demande de réinitialisation de mot de passe"
      );

      const response: PasswordResponse = {
        message:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordData;

      if (!token || !password) {
        throw new ValidationError("Le token et le mot de passe sont requis");
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new ValidationError(
          "Token de réinitialisation invalide ou expiré"
        );
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

      // Mettre à jour le mot de passe
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Log the action
      await securityLogService.logEvent(
        user._id,
        "RESET_PASSWORD",
        "Réinitialisation de mot de passe réussie"
      );

      const response: PasswordResponse = {
        message: "Le mot de passe a été réinitialisé avec succès",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
