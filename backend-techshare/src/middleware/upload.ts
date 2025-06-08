import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { logger } from "../utils/logger";
import path from "path";
import { Request } from "express";
import { ValidationError } from "../utils/errors";

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "techshare",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  } as any,
});

// Create multer upload instance
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      logger.warn("Type de fichier non autorisé:", {
        filename: file.originalname,
        mimetype: file.mimetype,
      });
      return cb(
        new Error(
          "Type de fichier non autorisé. Formats acceptés : JPG, JPEG, PNG, GIF"
        )
      );
    }
    cb(null, true);
  },
}).array("images", 5);

// Export cloudinary instance for direct usage
export { cloudinary };

// Configuration du stockage
const diskStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filtre des fichiers
const diskFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Vérification du type de fichier
  if (!file.mimetype.startsWith("image/")) {
    cb(new ValidationError("Seuls les fichiers images sont autorisés"));
    return;
  }

  // Vérification de l'extension
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    cb(
      new ValidationError(
        `Les extensions autorisées sont : ${allowedExtensions.join(", ")}`
      )
    );
    return;
  }

  cb(null, true);
};

// Configuration de multer
export const diskUploadMiddleware = multer({
  storage: diskStorage,
  fileFilter: diskFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
