"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.MONGODB_URI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Options de connexion à MongoDB
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: process.env.NODE_ENV === 'development',
    serverSelectionTimeoutMS: 10000, // Augmenté à 10 secondes
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4
    maxPoolSize: 10, // Limite le nombre de connexions
    minPoolSize: 5, // Maintient un minimum de connexions
    retryWrites: true,
    retryReads: true
};
exports.options = options;
// URI de connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
exports.MONGODB_URI = MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI doit être défini dans les variables d\'environnement');
}
//# sourceMappingURL=config.js.map