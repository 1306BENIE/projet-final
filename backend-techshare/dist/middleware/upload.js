"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diskUploadMiddleware = exports.cloudinary = exports.uploadMiddleware = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
exports.cloudinary = cloudinary_1.default;
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const errors_1 = require("../utils/errors");
// Configure storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: "techshare",
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
        transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    },
});
// Create multer upload instance
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            logger_1.logger.warn("Type de fichier non autorisé:", {
                filename: file.originalname,
                mimetype: file.mimetype,
            });
            return cb(new Error("Type de fichier non autorisé. Formats acceptés : JPG, JPEG, PNG, GIF"));
        }
        cb(null, true);
    },
}).array("images", 5);
// Configuration du stockage
const diskStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Filtre des fichiers
const diskFileFilter = (_req, file, cb) => {
    // Vérification du type de fichier
    if (!file.mimetype.startsWith("image/")) {
        cb(new errors_1.ValidationError("Seuls les fichiers images sont autorisés"));
        return;
    }
    // Vérification de l'extension
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        cb(new errors_1.ValidationError(`Les extensions autorisées sont : ${allowedExtensions.join(", ")}`));
        return;
    }
    cb(null, true);
};
// Configuration de multer
exports.diskUploadMiddleware = (0, multer_1.default)({
    storage: diskStorage,
    fileFilter: diskFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});
//# sourceMappingURL=upload.js.map