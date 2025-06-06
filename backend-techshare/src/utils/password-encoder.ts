import bcrypt from "bcryptjs";
import { logger } from "./logger";

export class PasswordEncoder {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash un mot de passe
   * @param password - Le mot de passe en clair
   * @returns Promise<string> - Le mot de passe hashé
   */
  public static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      logger.debug("Mot de passe hashé avec succès");
      return hashedPassword;
    } catch (error) {
      logger.error("Erreur lors du hachage du mot de passe:", error);
      throw new Error("Erreur lors du hachage du mot de passe");
    }
  }

  /**
   * Vérifie si un mot de passe correspond à son hash
   * @param password - Le mot de passe en clair à vérifier
   * @param hashedPassword - Le mot de passe hashé stocké
   * @returns Promise<boolean> - True si le mot de passe correspond
   */
  public static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      logger.debug("Vérification du mot de passe terminée", { isMatch });
      return isMatch;
    } catch (error) {
      logger.error("Erreur lors de la vérification du mot de passe:", error);
      throw new Error("Erreur lors de la vérification du mot de passe");
    }
  }

  /**
   * Vérifie si un mot de passe respecte les critères de sécurité
   * @param password - Le mot de passe à vérifier
   * @returns { isValid: boolean; errors: string[] } - Résultat de la validation
   */
  public static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      errors.push(
        `Le mot de passe doit contenir au moins ${minLength} caractères`
      );
    }
    if (!hasUpperCase) {
      errors.push(
        "Le mot de passe doit contenir au moins une lettre majuscule"
      );
    }
    if (!hasLowerCase) {
      errors.push(
        "Le mot de passe doit contenir au moins une lettre minuscule"
      );
    }
    if (!hasNumbers) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }
    if (!hasSpecialChar) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    if (!result.isValid) {
      logger.warn("Validation du mot de passe échouée", {
        errors: result.errors,
      });
    } else {
      logger.debug("Validation du mot de passe réussie");
    }

    return result;
  }

  /**
   * Génère un mot de passe aléatoire sécurisé
   * @param length - Longueur du mot de passe (par défaut: 12)
   * @returns string - Le mot de passe généré
   */
  public static generateSecurePassword(length: number = 12): string {
    try {
      const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(),.?":{}|<>';
      let password = "";

      // Assurer au moins un caractère de chaque type
      password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Majuscule
      password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Minuscule
      password += "0123456789"[Math.floor(Math.random() * 10)]; // Chiffre
      password += '!@#$%^&*(),.?":{}|<>'[Math.floor(Math.random() * 20)]; // Caractère spécial

      // Compléter le reste du mot de passe
      for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }

      // Mélanger le mot de passe
      const securePassword = password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
      logger.debug("Mot de passe sécurisé généré avec succès");
      return securePassword;
    } catch (error) {
      logger.error(
        "Erreur lors de la génération du mot de passe sécurisé:",
        error
      );
      throw new Error("Erreur lors de la génération du mot de passe sécurisé");
    }
  }
}

// Exemple d'utilisation:
/*
// Hachage d'un mot de passe
const hashedPassword = await PasswordEncoder.hashPassword('MonMotDePasse123!');

// Vérification d'un mot de passe
const isValid = await PasswordEncoder.comparePassword('MonMotDePasse123!', hashedPassword);

// Validation d'un mot de passe
const validation = PasswordEncoder.validatePassword('MonMotDePasse123!');
if (!validation.isValid) {
  console.log('Erreurs de validation:', validation.errors);
}

// Génération d'un mot de passe sécurisé
const securePassword = PasswordEncoder.generateSecurePassword();
*/
