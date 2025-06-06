import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

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
winston.addColors(colors);

// Format personnalisé pour les logs
const format = winston.format.combine(
  // Ajout du timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Ajout des couleurs
  winston.format.colorize({ all: true }),
  // Format du message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Configuration des transports (où les logs seront stockés)
const transports = [
  // Console pour le développement
  new winston.transports.Console(),

  // Fichier pour les erreurs
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),

  // Fichier pour tous les logs
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Création du logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Création d'un stream pour Morgan (si vous utilisez Morgan pour les logs HTTP)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export d'une fonction helper pour logger les erreurs
export const logError = (error: Error, context?: string) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    ...(error as any).metadata,
  });
};

// Export d'une fonction helper pour logger les requêtes HTTP
export const logHttpRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';
  
  logger.http(`${method} ${originalUrl}`, {
    ip,
    userAgent,
    userId: req.user?.userId
  });
  
  next();
};

// Export d'une fonction helper pour logger les actions de sécurité
export const logSecurityEvent = (
  action: string,
  details: any,
  userId?: string
) => {
  logger.warn(`Security Event: ${action}`, {
    userId,
    ...details,
  });
};

// Export d'une fonction helper pour logger les performances
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: any
) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...metadata,
  });
};
