#!/usr/bin/env node

/**
 * Script de validation des variables d'environnement
 * Usage: node scripts/validate-env.js
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..", "..");

console.log("🔧 Validation des variables d'environnement...\n");

// Vérifier les fichiers d'environnement
const envFiles = [".env.local", ".env.development", ".env.production", ".env"];

const foundFiles = [];
const missingFiles = [];

envFiles.forEach((file) => {
  const filePath = join(__dirname, file);
  if (existsSync(filePath)) {
    foundFiles.push(file);
    console.log(`✅ ${file} trouvé`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} manquant`);
  }
});

console.log("\n📋 Contenu des fichiers trouvés:");

foundFiles.forEach((file) => {
  const filePath = join(__dirname, file);
  try {
    const content = readFileSync(filePath, "utf8");
    console.log(`\n📄 ${file}:`);

    const lines = content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    if (lines.length === 0) {
      console.log("   (vide ou commentaires uniquement)");
    } else {
      lines.forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=");

        if (key && value) {
          // Masquer les valeurs sensibles
          const maskedValue =
            key.includes("KEY") || key.includes("SECRET")
              ? value.substring(0, 10) + "..."
              : value;

          console.log(`   ${key}=${maskedValue}`);
        }
      });
    }
  } catch (error) {
    console.log(`   ❌ Erreur de lecture: ${error.message}`);
  }
});

console.log("\n🎯 Recommandations:");

if (foundFiles.includes(".env.local")) {
  console.log("✅ .env.local trouvé - Configuration de développement OK");
} else {
  console.log(
    "⚠️  Créez un fichier .env.local avec vos vraies clés de développement"
  );
}

if (
  missingFiles.includes(".env.local") &&
  missingFiles.includes(".env.development")
) {
  console.log("⚠️  Aucun fichier d'environnement de développement trouvé");
  console.log(
    "📝 Créez .env.local avec VITE_STRIPE_PUBLIC_KEY=votre_cle_stripe"
  );
}

console.log("\n🔍 Validation terminée");
