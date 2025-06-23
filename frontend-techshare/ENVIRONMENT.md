# Variables d'environnement

Ce projet nécessite les variables d'environnement suivantes pour fonctionner correctement.

## Configuration requise

Créez un fichier `.env` à la racine du projet frontend avec les variables suivantes :

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key_here

# Environment
NODE_ENV=development
```

## Variables Stripe

### VITE_STRIPE_PUBLIC_KEY

- **Description** : Clé publique Stripe pour l'intégration du paiement côté client
- **Format** : `pk_test_...` pour l'environnement de test, `pk_live_...` pour la production
- **Où l'obtenir** : Dashboard Stripe > Developers > API keys
- **Exemple** : `pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG`

## Configuration backend

Le backend nécessite également des variables d'environnement Stripe :

```env
# Stripe Configuration (Backend)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Sécurité

⚠️ **Important** :

- Ne jamais commiter les clés secrètes dans le code
- Utiliser des clés de test pour le développement
- Changer les clés en production
- Le fichier `.env` est déjà dans `.gitignore`
