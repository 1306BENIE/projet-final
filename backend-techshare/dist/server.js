"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const connection_1 = __importDefault(require("./db-connection/connection"));
const logger_1 = require("./utils/logger");
const PORT = process.env.PORT || 3000;
// Connexion à la base de données
connection_1.default.connect()
    .then(() => {
    // Démarrage du serveur
    app_1.default.listen(PORT, () => {
        logger_1.logger.info(`Le serveur a bien démarré sur le port http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    logger_1.logger.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
});
// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
    logger_1.logger.error("Erreur non capturée:", error);
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    logger_1.logger.error("Promesse rejetée non gérée:", error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map