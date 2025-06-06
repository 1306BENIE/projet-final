import mongoose from 'mongoose';
import { MONGODB_URI, options } from './config';
import { logger } from '../utils/logger';


// on vérifie qu'il n'y a qu'une seule instance de connexion

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Utilisation de la connexion à la base de données existante');
      return;
    }

    try {
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement');
      }

      const db = await mongoose.connect(MONGODB_URI, options);
      this.isConnected = db.connections[0].readyState === 1;
      
      if (this.isConnected) {
        logger.info('Connexion à la base de données réussie');
      }

      // Gestion des événements de connexion
      mongoose.connection.on('error', (err) => {
        logger.error('Erreur de connexion à la base de données:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB déconnecté');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnecté');
        this.isConnected = true;
      });

      // Gestion de la terminaison de l'application
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Erreur de connexion à la base de données:', error);
      throw error;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('Fermeture de la connexion à la base de données');
      process.exit(0);
    } catch (error) {
      console.error('Erreur lors de la fermeture de la connexion à la base de données:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB déconnecté avec succès');
    } catch (error) {
      console.error('Erreur lors de la déconnexion de MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default Database.getInstance(); 