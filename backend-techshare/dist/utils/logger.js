"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logSecurityEvent = exports.logHttpRequest = exports.logError = exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.DailyRotateFile({
        filename: path_1.default.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new winston_1.default.transports.DailyRotateFile({
        filename: path_1.default.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
exports.stream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
const logError = (error, context) => {
    exports.logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
        stack: error.stack,
        ...error.metadata,
    });
};
exports.logError = logError;
const logHttpRequest = (req, _res, next) => {
    var _a;
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    exports.logger.http(`${method} ${originalUrl}`, {
        ip,
        userAgent,
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
    });
    next();
};
exports.logHttpRequest = logHttpRequest;
const logSecurityEvent = (action, details, userId) => {
    exports.logger.warn(`Security Event: ${action}`, {
        userId,
        ...details,
    });
};
exports.logSecurityEvent = logSecurityEvent;
const logPerformance = (operation, duration, metadata) => {
    exports.logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...metadata,
    });
};
exports.logPerformance = logPerformance;
//# sourceMappingURL=logger.js.map