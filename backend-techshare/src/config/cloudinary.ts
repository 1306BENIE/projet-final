import { v2 as cloudinary } from "cloudinary";
import { config } from "./index";
import { logger } from "../utils/logger";

try {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  logger.info("Configuration Cloudinary initialisée avec succès");
} catch (error) {
  logger.error("Erreur lors de l'initialisation de Cloudinary:", error);
  throw new Error("Échec de l'initialisation de Cloudinary");
}

export default cloudinary;
