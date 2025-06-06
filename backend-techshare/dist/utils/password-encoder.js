"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordEncoder = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("./logger");
class PasswordEncoder {
    /**
     * Hash un mot de passe
     * @param password - Le mot de passe en clair
     * @returns Promise<string> - Le mot de passe hashé
     */
    static async hashPassword(password) {
        try {
            const salt = await bcryptjs_1.default.genSalt(this.SALT_ROUNDS);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            logger_1.logger.debug("Mot de passe hashé avec succès");
            return hashedPassword;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors du hachage du mot de passe:", error);
            throw new Error("Erreur lors du hachage du mot de passe");
        }
    }
    /**
     * Vérifie si un mot de passe correspond à son hash
     * @param password - Le mot de passe en clair à vérifier
     * @param hashedPassword - Le mot de passe hashé stocké
     * @returns Promise<boolean> - True si le mot de passe correspond
     */
    static async comparePassword(password, hashedPassword) {
        try {
            const isMatch = await bcryptjs_1.default.compare(password, hashedPassword);
            logger_1.logger.debug("Vérification du mot de passe terminée", { isMatch });
            return isMatch;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la vérification du mot de passe:", error);
            throw new Error("Erreur lors de la vérification du mot de passe");
        }
    }
    /**
     * Vérifie si un mot de passe respecte les critères de sécurité
     * @param password - Le mot de passe à vérifier
     * @returns { isValid: boolean; errors: string[] } - Résultat de la validation
     */
    static validatePassword(password) {
        const errors = [];
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < minLength) {
            errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
        }
        if (!hasUpperCase) {
            errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
        }
        if (!hasLowerCase) {
            errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
        }
        if (!hasNumbers) {
            errors.push("Le mot de passe doit contenir au moins un chiffre");
        }
        if (!hasSpecialChar) {
            errors.push("Le mot de passe doit contenir au moins un caractère spécial");
        }
        const result = {
            isValid: errors.length === 0,
            errors,
        };
        if (!result.isValid) {
            logger_1.logger.warn("Validation du mot de passe échouée", {
                errors: result.errors,
            });
        }
        else {
            logger_1.logger.debug("Validation du mot de passe réussie");
        }
        return result;
    }
    /**
     * Génère un mot de passe aléatoire sécurisé
     * @param length - Longueur du mot de passe (par défaut: 12)
     * @returns string - Le mot de passe généré
     */
    static generateSecurePassword(length = 12) {
        try {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(),.?":{}|<>';
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
            logger_1.logger.debug("Mot de passe sécurisé généré avec succès");
            return securePassword;
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la génération du mot de passe sécurisé:", error);
            throw new Error("Erreur lors de la génération du mot de passe sécurisé");
        }
    }
}
exports.PasswordEncoder = PasswordEncoder;
PasswordEncoder.SALT_ROUNDS = 10;
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
//# sourceMappingURL=password-encoder.js.map