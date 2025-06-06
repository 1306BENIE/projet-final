# TechShare Backend

Backend API pour l'application TechShare, une plateforme de location d'outils IT entre particuliers.

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB
- Redis
- Compte Stripe
- Compte Cloudinary
- Compte Email (Gmail recommandé)

## Installation

1. Cloner le repository :

```bash
git clone https://github.com/votre-username/techshare.git
cd techshare/backend-techshare
```

2. Installer les dépendances :

```bash
npm install
```

3. Configurer les variables d'environnement :

- Copier le fichier `.env.example` en `.env`
- Remplir les variables d'environnement avec vos propres valeurs

4. Démarrer le serveur de développement :

```bash
npm run dev
```

## Structure du Projet

```
backend-techshare/
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Contrôleurs
│   ├── middleware/     # Middleware
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── services/       # Services métier
│   ├── utils/          # Utilitaires
│   └── app.ts          # Point d'entrée
├── tests/              # Tests
├── .env                # Variables d'environnement
├── .gitignore
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentification

- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- POST /api/auth/refresh-token - Rafraîchir le token
- POST /api/auth/logout - Déconnexion

### Utilisateurs

- GET /api/users/profile - Profil utilisateur
- PUT /api/users/profile - Mettre à jour le profil
- PUT /api/users/password - Changer le mot de passe

### Outils

- GET /api/tools - Liste des outils
- POST /api/tools - Créer un outil
- GET /api/tools/:id - Détails d'un outil
- PUT /api/tools/:id - Mettre à jour un outil
- DELETE /api/tools/:id - Supprimer un outil

### Locations

- GET /api/rentals - Liste des locations
- POST /api/rentals - Créer une location
- GET /api/rentals/:id - Détails d'une location
- PUT /api/rentals/:id - Mettre à jour une location
- DELETE /api/rentals/:id - Annuler une location

### Paiements

- POST /api/payments/create-intent - Créer une intention de paiement
- POST /api/payments/webhook - Webhook Stripe

## Tests

```bash
# Lancer les tests
npm test

# Lancer les tests avec couverture
npm run test:coverage
```

## Déploiement

1. Construire l'application :

```bash
npm run build
```

2. Démarrer en production :

```bash
npm start
```

## Sécurité

- Toutes les routes sont protégées par JWT
- Les mots de passe sont hashés avec bcrypt
- Les données sensibles sont chiffrées
- Protection contre les attaques CSRF
- Rate limiting sur les routes sensibles
- Validation des entrées avec Joi

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Auteur

- **BENIE SYLVESTRE**

## Remerciement

- **M. MAXENCE YROWAH** mon instructeur
- _**GOMYCODE**_

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
