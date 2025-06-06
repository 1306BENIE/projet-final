"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const recommendationController_1 = require("../controllers/recommendationController");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Système de recommandation d'outils
 *
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       properties:
 *         tool:
 *           $ref: '#/components/schemas/Tool'
 *         score:
 *           type: number
 *           description: Score de pertinence de la recommandation
 *         reason:
 *           type: string
 *           description: Raison de la recommandation
 *
 *     Tool:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *         owner:
 *           type: string
 */
/**
 * @swagger
 * /api/recommendations/personalized:
 *   get:
 *     summary: Récupère les recommandations personnalisées pour l'utilisateur
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtre par catégorie
 *     responses:
 *       200:
 *         description: Recommandations récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recommendation'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get("/personalized", auth_1.auth, validatePagination_1.validatePagination, recommendationController_1.recommendationController.getPersonalizedRecommendations);
/**
 * @swagger
 * /api/recommendations/similar/{toolId}:
 *   get:
 *     summary: Récupère les outils similaires à un outil donné
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil de référence
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: minSimilarity
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           default: 0.5
 *         description: Score de similarité minimum
 *     responses:
 *       200:
 *         description: Outils similaires récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recommendation'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: ID d'outil invalide
 *       404:
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/similar/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), validatePagination_1.validatePagination, recommendationController_1.recommendationController.getSimilarTools);
/**
 * @swagger
 * /api/recommendations/popular:
 *   get:
 *     summary: Récupère les outils les plus populaires
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtre par catégorie
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Période de temps pour le calcul de la popularité
 *     responses:
 *       200:
 *         description: Outils populaires récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recommendation'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get("/popular", validatePagination_1.validatePagination, recommendationController_1.recommendationController.getPopularTools);
exports.default = router;
//# sourceMappingURL=recommendationRoutes.js.map