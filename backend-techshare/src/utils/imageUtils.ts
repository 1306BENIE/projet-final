import cloudinary from "../config/cloudinary";
import { logger } from "./logger";

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.debug("Image supprimée avec succès", { publicId });
  } catch (error) {
    logger.error("Erreur lors de la suppression de l'image:", error);
    throw new Error("Échec de la suppression de l'image");
  }
};

export const getImageUrl = (publicId: string, options = {}): string => {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
    logger.debug("URL de l'image générée avec succès", { publicId });
    return url;
  } catch (error) {
    logger.error("Erreur lors de la génération de l'URL de l'image:", error);
    throw new Error("Échec de la génération de l'URL de l'image");
  }
};

export const optimizeImage = async (publicId: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      eager: [
        { width: 300, height: 300, crop: "fill" },
        { width: 600, height: 600, crop: "fill" },
      ],
    });
    logger.debug("Image optimisée avec succès", { publicId });
    return result.secure_url;
  } catch (error) {
    logger.error("Erreur lors de l'optimisation de l'image:", error);
    throw new Error("Échec de l'optimisation de l'image");
  }
};
