"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordEncoder = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("./logger");
class PasswordEncoder {
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
    static generateSecurePassword(length = 12) {
        try {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(),.?":{}|<>';
            let password = "";
            password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
            password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
            password += "0123456789"[Math.floor(Math.random() * 10)];
            password += '!@#$%^&*(),.?":{}|<>'[Math.floor(Math.random() * 20)];
            for (let i = password.length; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }
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
//# sourceMappingURL=password-encoder.js.map