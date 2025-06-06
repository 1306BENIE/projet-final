import express from "express";
import { searchController } from "../controllers/searchController";

const router = express.Router();

// Route de recherche avancée
router.get("/tools", searchController.searchTools);

// Route pour les outils populaires
router.get("/tools/popular", searchController.getPopularTools);

// Route pour les outils à proximité
router.get("/tools/nearby", searchController.getNearbyTools);

export default router;
