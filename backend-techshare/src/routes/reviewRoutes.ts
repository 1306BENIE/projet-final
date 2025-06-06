import express from "express";
import { auth } from "../middleware/auth";
import { validateReview } from "../validations";
import { reviewController } from "../controllers/reviewController";
import { errorHandler } from "../middleware/errorHandler";
import { validateObjectId } from "../middleware/validateObjectId";
import { validatePagination } from "../middleware/validatePagination";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gestion des avis sur les outils
 *
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         tool:
 *           $ref: '#/components/schemas/Tool'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         helpful:
 *           type: number
 *         helpfulUsers:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crée un nouvel avis
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolId
 *               - rating
 *             properties:
 *               toolId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avis créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post(
  "/",
  auth,
  validateReview,
  errorHandler(reviewController.createReview)
);

/**
 * @swagger
 * /api/reviews/tool/{toolId}:
 *   get:
 *     summary: Récupère les avis d'un outil
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil
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
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, rating, helpful]
 *           default: date
 *         description: Critère de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Avis récupérés avec succès
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
 *                     $ref: '#/components/schemas/Review'
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
router.get(
  "/tool/:toolId",
  validateObjectId("toolId"),
  validatePagination,
  errorHandler(reviewController.getReviewsByTool)
);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Récupère les avis d'un utilisateur
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
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
 *     responses:
 *       200:
 *         description: Avis récupérés avec succès
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
 *                     $ref: '#/components/schemas/Review'
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
 *         description: ID utilisateur invalide
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  validatePagination,
  errorHandler(reviewController.getReviewsByUser)
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Met à jour un avis
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avis mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Avis non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put(
  "/:reviewId",
  auth,
  validateObjectId("reviewId"),
  validateReview,
  errorHandler(reviewController.updateReview)
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Supprime un avis
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: Avis supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Avis non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  "/:reviewId",
  auth,
  validateObjectId("reviewId"),
  errorHandler(reviewController.deleteReview)
);

export default router;
