"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./logger");
// Charger les variables d'environnement
dotenv_1.default.config();
// Récupérer le mot de passe depuis les variables d'environnement
const PASSWORD = process.env.PASSWORD;
// Vérifier si le mot de passe est défini
if (!PASSWORD) {
    logger_1.logger.error("La variable d'environnement PASSWORD n'est pas définie");
    logger_1.logger.info("Veuillez définir PASSWORD dans le fichier .env à la racine du dossier backend/");
    process.exit(1);
}
try {
    // Encoder le mot de passe
    const encodedPassword = encodeURIComponent(PASSWORD);
    logger_1.logger.info("=== Encodage du mot de passe ===");
    logger_1.logger.info("Mot de passe original :", { password: PASSWORD });
    logger_1.logger.info("Mot de passe encodé  :", { encodedPassword });
}
catch (error) {
    logger_1.logger.error("Erreur lors de l'encodage du mot de passe:", error);
    process.exit(1);
}
//# sourceMappingURL=hash-mongo-password.js.map