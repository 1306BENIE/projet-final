"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: `"TechShare" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Réinitialisation de votre mot de passe TechShare",
            html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe TechShare.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        ">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>Cordialement,<br>L'équipe TechShare</p>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email de réinitialisation envoyé à ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
            throw error;
        }
    }
    async sendWelcomeEmail(user) {
        try {
            // TODO: Implémenter l'envoi d'email avec un service d'email
            logger_1.logger.info(`Email de bienvenue envoyé à ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
            throw error;
        }
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map