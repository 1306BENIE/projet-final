import express from "express";
import { auth } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";
import { validateObjectId } from "../middleware/validateObjectId";
import { validatePagination } from "../middleware/validatePagination";
import { adminController } from "../controllers/adminController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Routes d'administration de l'application
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         pages:
 *           type: integer
 */

// Toutes les routes admin sont protégées par l'authentification et le middleware isAdmin
router.use(auth, isAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Admin]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, prénom, email)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filtre par rôle
 *       - in: query
 *         name: isBanned
 *         schema:
 *           type: boolean
 *         description: Filtre par statut de bannissement
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                     $ref: '#/components/schemas/User'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/users", validatePagination, adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/ban:
 *   post:
 *     summary: Bannit un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à bannir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison du bannissement
 *     responses:
 *       200:
 *         description: Utilisateur banni avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/users/:userId/ban",
  validateObjectId("userId"),
  adminController.banUser
);

/**
 * @swagger
 * /api/admin/users/{userId}/unban:
 *   post:
 *     summary: Débannit un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à débannir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison du débannissement
 */
router.post(
  "/users/:userId/unban",
  validateObjectId("userId"),
  adminController.unbanUser
);

/**
 * @swagger
 * /api/admin/tools:
 *   get:
 *     summary: Récupère la liste des outils
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtre par catégorie
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtre par statut
 */
router.get("/tools", validatePagination, adminController.getTools);

/**
 * @swagger
 * /api/admin/tools/{toolId}:
 *   delete:
 *     summary: Supprime un outil
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil à supprimer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison de la suppression
 */
router.delete(
  "/tools/:toolId",
  validateObjectId("toolId"),
  adminController.deleteTool
);

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Récupère la liste des avis
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filtre par note
 *       - in: query
 *         name: toolId
 *         schema:
 *           type: string
 *         description: Filtre par outil
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtre par utilisateur
 */
router.get("/reviews", validatePagination, adminController.getReviews);

/**
 * @swagger
 * /api/admin/reviews/{reviewId}:
 *   delete:
 *     summary: Supprime un avis
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis à supprimer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison de la suppression
 */
router.delete(
  "/reviews/:reviewId",
  validateObjectId("reviewId"),
  adminController.deleteReview
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Récupère les statistiques du tableau de bord
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalTools:
 *                   type: integer
 *                 totalRentals:
 *                   type: integer
 *                 totalReviews:
 *                   type: integer
 *                 activeRentals:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 recentActivity:
 *                   type: array
 */
router.get("/stats", adminController.getStats);

export default router;
