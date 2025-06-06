import express from "express";
import { logger } from "../utils/logger";

const router = express.Router();

// Route de test pour vérifier la connexion
router.get("/ping", (_req, res) => {
  logger.info("Test de connexion effectué");
  res.json({
    message: "Connexion réussie !",
    timestamp: new Date().toISOString(),
    status: "success",
  });
});

export default router;
