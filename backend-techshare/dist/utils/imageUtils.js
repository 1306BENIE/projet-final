"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeImage = exports.getImageUrl = exports.deleteImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const logger_1 = require("./logger");
const deleteImage = async (publicId) => {
    try {
        await cloudinary_1.default.uploader.destroy(publicId);
        logger_1.logger.debug("Image supprimée avec succès", { publicId });
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la suppression de l'image:", error);
        throw new Error("Échec de la suppression de l'image");
    }
};
exports.deleteImage = deleteImage;
const getImageUrl = (publicId, options = {}) => {
    try {
        const url = cloudinary_1.default.url(publicId, {
            secure: true,
            ...options,
        });
        logger_1.logger.debug("URL de l'image générée avec succès", { publicId });
        return url;
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de la génération de l'URL de l'image:", error);
        throw new Error("Échec de la génération de l'URL de l'image");
    }
};
exports.getImageUrl = getImageUrl;
const optimizeImage = async (publicId) => {
    try {
        const result = await cloudinary_1.default.uploader.explicit(publicId, {
            type: "upload",
            eager: [
                { width: 300, height: 300, crop: "fill" },
                { width: 600, height: 600, crop: "fill" },
            ],
        });
        logger_1.logger.debug("Image optimisée avec succès", { publicId });
        return result.secure_url;
    }
    catch (error) {
        logger_1.logger.error("Erreur lors de l'optimisation de l'image:", error);
        throw new Error("Échec de l'optimisation de l'image");
    }
};
exports.optimizeImage = optimizeImage;
//# sourceMappingURL=imageUtils.js.map