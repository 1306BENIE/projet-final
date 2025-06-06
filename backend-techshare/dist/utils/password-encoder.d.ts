export declare class PasswordEncoder {
    private static readonly SALT_ROUNDS;
    /**
     * Hash un mot de passe
     * @param password - Le mot de passe en clair
     * @returns Promise<string> - Le mot de passe hashé
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Vérifie si un mot de passe correspond à son hash
     * @param password - Le mot de passe en clair à vérifier
     * @param hashedPassword - Le mot de passe hashé stocké
     * @returns Promise<boolean> - True si le mot de passe correspond
     */
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Vérifie si un mot de passe respecte les critères de sécurité
     * @param password - Le mot de passe à vérifier
     * @returns { isValid: boolean; errors: string[] } - Résultat de la validation
     */
    static validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Génère un mot de passe aléatoire sécurisé
     * @param length - Longueur du mot de passe (par défaut: 12)
     * @returns string - Le mot de passe généré
     */
    static generateSecurePassword(length?: number): string;
}
