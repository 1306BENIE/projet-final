import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import db from "./db-connection/connection";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;

// Connexion à la base de données
db.connect()
  .then(() => {
    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(
        `Le serveur a bien démarré sur le port http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    logger.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  });

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  logger.error("Erreur non capturée:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Promesse rejetée non gérée:", error);
  process.exit(1);
});
