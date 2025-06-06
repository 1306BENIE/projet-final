import { Router } from "express";
import { notificationController } from "../controllers";
import { auth } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";
import { validateMiddleware } from "../middleware/validate";
import { validatePagination } from "../middleware/validatePagination";
import { notificationValidation } from "../validations/notificationValidation";
import { errorHandler } from "../middleware/errorHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications utilisateur
 *
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - type
 *         - message
 *         - recipient
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de la notification
 *         type:
 *           type: string
 *           enum: [RENTAL_REQUEST, RENTAL_ACCEPTED, RENTAL_REJECTED, RENTAL_COMPLETED, REVIEW_RECEIVED, SYSTEM]
 *           description: Type de notification
 *         message:
 *           type: string
 *           description: Message de la notification
 *         recipient:
 *           type: string
 *           description: ID de l'utilisateur destinataire
 *         read:
 *           type: boolean
 *           default: false
 *           description: État de lecture de la notification
 *         data:
 *           type: object
 *           description: Données supplémentaires liées à la notification
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupère les notifications de l'utilisateur
 *     tags: [Notifications]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RENTAL_REQUEST, RENTAL_ACCEPTED, RENTAL_REJECTED, RENTAL_COMPLETED, REVIEW_RECEIVED, SYSTEM]
 *         description: Filtre par type de notification
 *     responses:
 *       200:
 *         description: Liste des notifications récupérée avec succès
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
 *                     $ref: '#/components/schemas/Notification'
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
  "/",
  auth,
  validatePagination,
  validateMiddleware(notificationValidation.getUserNotifications),
  errorHandler(notificationController.getUserNotifications)
);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Récupère les notifications non lues de l'utilisateur
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Liste des notifications non lues récupérée avec succès
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
 *                     $ref: '#/components/schemas/Notification'
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
  "/unread",
  auth,
  validatePagination,
  validateMiddleware(notificationValidation.getUserNotifications),
  errorHandler(notificationController.getUnreadNotifications)
);

/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     summary: Récupère le nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues récupéré avec succès
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
 *                     count:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get(
  "/unread/count",
  auth,
  errorHandler(notificationController.getUnreadCount)
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  "/:id/read",
  auth,
  validateObjectId("id"),
  validateMiddleware(notificationValidation.markAsRead),
  errorHandler(notificationController.markAsRead)
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marque toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues avec succès
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
 *                     count:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.put(
  "/read-all",
  auth,
  errorHandler(notificationController.markAllAsRead)
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Supprime une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
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
 *                     id:
 *                       type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  "/:id",
  auth,
  validateObjectId("id"),
  validateMiddleware(notificationValidation.deleteNotification),
  errorHandler(notificationController.deleteNotification)
);

export default router;
