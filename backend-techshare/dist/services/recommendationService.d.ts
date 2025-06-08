import { ITool } from "../interfaces/tool.interface";
interface PopularToolsOptions {
    page: number;
    limit: number;
    category?: string;
    timeRange: string;
}
interface PopularToolsResult {
    tools: ITool[];
    total: number;
}
declare class RecommendationService {
    /**
     * Génère des recommandations personnalisées pour un utilisateur
     * @param userId - ID de l'utilisateur
     * @param limit - Nombre maximum de recommandations à retourner
     * @returns Liste des outils recommandés
     */
    getPersonalizedRecommendations(userId: string, limit?: number): Promise<ITool[]>;
    /**
     * Récupère l'historique d'un utilisateur (locations et avis)
     * @param userId - ID de l'utilisateur
     * @returns Historique de l'utilisateur
     */
    private getUserHistory;
    /**
     * Analyse les préférences d'un utilisateur basées sur son historique
     * @param history - Historique de l'utilisateur
     * @returns Préférences de l'utilisateur
     */
    private analyzeUserPreferences;
    /**
     * Génère des recommandations basées sur les préférences de l'utilisateur
     * @param userId - ID de l'utilisateur
     * @param preferences - Préférences de l'utilisateur
     * @param limit - Nombre maximum de recommandations
     * @returns Liste des outils recommandés
     */
    private generateRecommendations;
    /**
     * Récupère les outils les plus populaires
     * @param options - Options de recherche
     * @returns Liste des outils populaires
     */
    getPopularTools(options: PopularToolsOptions): Promise<PopularToolsResult>;
    /**
     * Récupère des outils similaires à un outil donné
     * @param toolId - ID de l'outil de référence
     * @param limit - Nombre maximum d'outils similaires
     * @returns Liste des outils similaires
     */
    getSimilarTools(toolId: string, limit?: number): Promise<ITool[]>;
}
export declare const initializeRecommendationService: () => RecommendationService;
export declare const getRecommendationService: () => RecommendationService;
export {};
