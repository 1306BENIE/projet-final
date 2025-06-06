"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const toolController_1 = require("../controllers/toolController");
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const upload_1 = require("../middleware/upload");
const validateTool_1 = require("../middleware/validateTool");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Tools
 *   description: Gestion des outils
 *
 * components:
 *   schemas:
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
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         available:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Récupère la liste des outils
 *     tags: [Tools]
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
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filtre par disponibilité
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, date, rating]
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
 *         description: Liste des outils récupérée avec succès
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
 *                     $ref: '#/components/schemas/Tool'
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
router.get("/", validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(toolController_1.toolController.getTools));
/**
 * @swagger
 * /api/tools/{toolId}:
 *   get:
 *     summary: Récupère un outil par son ID
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil
 *     responses:
 *       200:
 *         description: Outil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Tool'
 *       400:
 *         description: ID d'outil invalide
 *       404:
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), (0, errorHandler_1.errorHandler)(toolController_1.toolController.getToolById));
/**
 * @swagger
 * /api/tools:
 *   post:
 *     summary: Crée un nouvel outil
 *     tags: [Tools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - price
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Outil créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Tool'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth_1.auth, upload_1.diskUploadMiddleware.array("images", 5), validateTool_1.validateTool, (0, errorHandler_1.errorHandler)(toolController_1.toolController.createTool));
/**
 * @swagger
 * /api/tools/{toolId}:
 *   put:
 *     summary: Met à jour un outil
 *     tags: [Tools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Tool'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:toolId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("toolId"), upload_1.diskUploadMiddleware.array("images", 5), validateTool_1.validateTool, (0, errorHandler_1.errorHandler)(toolController_1.toolController.updateTool));
/**
 * @swagger
 * /api/tools/{toolId}:
 *   delete:
 *     summary: Supprime un outil
 *     tags: [Tools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil
 *     responses:
 *       200:
 *         description: Outil supprimé avec succès
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
 *         description: Outil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:toolId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("toolId"), (0, errorHandler_1.errorHandler)(toolController_1.toolController.deleteTool));
/**
 * @swagger
 * /api/tools/user/tools:
 *   get:
 *     summary: Récupère les outils d'un utilisateur
 *     tags: [Tools]
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
 *         description: Outils récupérés avec succès
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
 *                     $ref: '#/components/schemas/Tool'
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
router.get("/user/tools", auth_1.auth, validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(toolController_1.toolController.getUserTools));
exports.default = router;
//# sourceMappingURL=toolRoutes.js.map