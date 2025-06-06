import dotenv from "dotenv";
import { logger } from "./logger";

// Charger les variables d'environnement
dotenv.config();

// Récupérer le mot de passe depuis les variables d'environnement
const PASSWORD = process.env.PASSWORD;

// Vérifier si le mot de passe est défini
if (!PASSWORD) {
  logger.error("La variable d'environnement PASSWORD n'est pas définie");
  logger.info(
    "Veuillez définir PASSWORD dans le fichier .env à la racine du dossier backend/"
  );
  process.exit(1);
}

try {
  // Encoder le mot de passe
  const encodedPassword = encodeURIComponent(PASSWORD);

  logger.info("=== Encodage du mot de passe ===");
  logger.info("Mot de passe original :", { password: PASSWORD });
  logger.info("Mot de passe encodé  :", { encodedPassword });
} catch (error) {
  logger.error("Erreur lors de l'encodage du mot de passe:", error);
  process.exit(1);
}
