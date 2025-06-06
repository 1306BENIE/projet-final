import express from "express";
import { rentalController } from "../controllers/rentalController";
import { auth } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";
import { validatePagination } from "../middleware/validatePagination";
import { validateRental } from "../middleware/validateRental";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rentals
 *   description: Gestion des locations d'outils
 *
 * components:
 *   schemas:
 *     Rental:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         tool:
 *           $ref: '#/components/schemas/Tool'
 *         renter:
 *           $ref: '#/components/schemas/User'
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, completed, cancelled]
 *         totalPrice:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded]
 *         review:
 *           $ref: '#/components/schemas/Review'
 *
 *     Review:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rentals:
 *   post:
 *     summary: Crée une nouvelle demande de location
 *     tags: [Rentals]
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
 *               - startDate
 *               - endDate
 *             properties:
 *               toolId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Location créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, validateRental, rentalController.createRental);

/**
 * @swagger
 * /api/rentals/user:
 *   get:
 *     summary: Récupère les locations de l'utilisateur connecté
 *     tags: [Rentals]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, completed, cancelled]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Locations récupérées avec succès
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
 *                     $ref: '#/components/schemas/Rental'
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
router.get("/user", auth, validatePagination, rentalController.getUserRentals);

/**
 * @swagger
 * /api/rentals/owner:
 *   get:
 *     summary: Récupère les locations des outils de l'utilisateur connecté
 *     tags: [Rentals]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, completed, cancelled]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Locations récupérées avec succès
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
 *                     $ref: '#/components/schemas/Rental'
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
router.get(
  "/owner",
  auth,
  validatePagination,
  rentalController.getOwnerRentals
);

/**
 * @swagger
 * /api/rentals/{id}/status:
 *   put:
 *     summary: Met à jour le statut d'une location
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, completed, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Location non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  "/:id/status",
  auth,
  validateObjectId("id"),
  rentalController.updateRentalStatus
);

/**
 * @swagger
 * /api/rentals/{id}/review:
 *   post:
 *     summary: Ajoute un avis à une location
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la location
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
 *       201:
 *         description: Avis ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Location non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post(
  "/:id/review",
  auth,
  validateObjectId("id"),
  rentalController.addReview
);

export default router;
