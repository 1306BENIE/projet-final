"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logSecurityEvent = exports.logHttpRequest = exports.logError = exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
// Définition des niveaux de log
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Choix du niveau de log en fonction de l'environnement
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
// Définition des couleurs pour chaque niveau
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Ajout des couleurs à Winston
winston_1.default.addColors(colors);
// Format personnalisé pour les logs
const format = winston_1.default.format.combine(
// Ajout du timestamp
winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), 
// Ajout des couleurs
winston_1.default.format.colorize({ all: true }), 
// Format du message
winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Configuration des transports (où les logs seront stockés)
const transports = [
    // Console pour le développement
    new winston_1.default.transports.Console(),
    // Fichier pour les erreurs
    new winston_1.default.transports.DailyRotateFile({
        filename: path_1.default.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    // Fichier pour tous les logs
    new winston_1.default.transports.DailyRotateFile({
        filename: path_1.default.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
// Création du logger
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
// Création d'un stream pour Morgan (si vous utilisez Morgan pour les logs HTTP)
exports.stream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
// Export d'une fonction helper pour logger les erreurs
const logError = (error, context) => {
    exports.logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
        stack: error.stack,
        ...error.metadata,
    });
};
exports.logError = logError;
// Export d'une fonction helper pour logger les requêtes HTTP
const logHttpRequest = (req, _res, next) => {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    exports.logger.http(`${method} ${originalUrl}`, {
        ip,
        userAgent,
        userId: req.user?.userId
    });
    next();
};
exports.logHttpRequest = logHttpRequest;
// Export d'une fonction helper pour logger les actions de sécurité
const logSecurityEvent = (action, details, userId) => {
    exports.logger.warn(`Security Event: ${action}`, {
        userId,
        ...details,
    });
};
exports.logSecurityEvent = logSecurityEvent;
// Export d'une fonction helper pour logger les performances
const logPerformance = (operation, duration, metadata) => {
    exports.logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...metadata,
    });
};
exports.logPerformance = logPerformance;
//# sourceMappingURL=logger.js.map