/**
 * Configuration centralisée pour les variables d'environnement
 * Gère la hiérarchie des fichiers .env de Vite et valide la configuration
 */

interface AppConfig {
  apiUrl: string;
  stripe: {
    publicKey: string;
    isConfigured: boolean;
  };
  environment: string;
}

// Validation des variables d'environnement
const validateStripeConfig = (): {
  publicKey: string;
  isConfigured: boolean;
} => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  if (!publicKey) {
    console.error("❌ VITE_STRIPE_PUBLIC_KEY n'est pas définie");
    console.error("📝 Créez un fichier .env.local avec votre clé Stripe");
    return { publicKey: "", isConfigured: false };
  }

  if (
    publicKey === "pk_test_your_stripe_publishable_key_here" ||
    publicKey.includes("your_stripe") ||
    publicKey.includes("placeholder")
  ) {
    console.error("❌ VITE_STRIPE_PUBLIC_KEY contient une valeur placeholder");
    console.error("📝 Remplacez par votre vraie clé publique Stripe");
    return { publicKey, isConfigured: false };
  }

  if (!publicKey.startsWith("pk_test_") && !publicKey.startsWith("pk_live_")) {
    console.error("❌ VITE_STRIPE_PUBLIC_KEY n'a pas le bon format");
    console.error("📝 La clé doit commencer par 'pk_test_' ou 'pk_live_'");
    return { publicKey, isConfigured: false };
  }

  console.log("✅ Configuration Stripe valide");
  return { publicKey, isConfigured: true };
};

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  stripe: validateStripeConfig(),
  environment: import.meta.env.NODE_ENV || "development",
};

// Fonction utilitaire pour vérifier la configuration au démarrage
export const validateConfiguration = (): void => {
  console.log("🔧 Validation de la configuration...");
  console.log("🌍 Environnement:", config.environment);
  console.log("🔗 API URL:", config.apiUrl);
  console.log("💳 Stripe configuré:", config.stripe.isConfigured);

  if (!config.stripe.isConfigured) {
    console.warn("⚠️  Stripe n'est pas correctement configuré");
    console.warn("📋 Consultez ENVIRONMENT.md pour la configuration");
  }
};

// Export des valeurs individuelles pour compatibilité
export const STRIPE_PUBLIC_KEY = config.stripe.publicKey;
export const API_URL = config.apiUrl;
