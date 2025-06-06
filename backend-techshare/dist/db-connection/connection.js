"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
// on vérifie qu'il n'y a qu'une seule instance de connexion
class Database {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.logger.info("Utilisation de la connexion à la base de données existante");
            return;
        }
        try {
            if (!config_1.config.mongoUri) {
                throw new Error("MONGODB_URI n'est pas défini dans les variables d'environnement");
            }
            const options = {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };
            const db = await mongoose_1.default.connect(config_1.config.mongoUri, options);
            this.isConnected = db.connections[0].readyState === 1;
            if (this.isConnected) {
                logger_1.logger.info("Connexion à la base de données réussie");
            }
            // Gestion des événements de connexion
            mongoose_1.default.connection.on("error", (err) => {
                logger_1.logger.error("Erreur de connexion à la base de données:", err);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("disconnected", () => {
                logger_1.logger.warn("MongoDB déconnecté");
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("reconnected", () => {
                logger_1.logger.info("MongoDB reconnecté");
                this.isConnected = true;
            });
            // Gestion de la terminaison de l'application
            process.on("SIGINT", this.gracefulShutdown.bind(this));
            process.on("SIGTERM", this.gracefulShutdown.bind(this));
        }
        catch (error) {
            logger_1.logger.error("Erreur de connexion à la base de données:", error);
            throw error;
        }
    }
    async gracefulShutdown() {
        try {
            await mongoose_1.default.connection.close();
            console.log("Fermeture de la connexion à la base de données");
            process.exit(0);
        }
        catch (error) {
            console.error("Erreur lors de la fermeture de la connexion à la base de données:", error);
            process.exit(1);
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.connection.close();
            this.isConnected = false;
            console.log("MongoDB déconnecté avec succès");
        }
        catch (error) {
            console.error("Erreur lors de la déconnexion de MongoDB:", error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.default = Database.getInstance();
//# sourceMappingURL=connection.js.map