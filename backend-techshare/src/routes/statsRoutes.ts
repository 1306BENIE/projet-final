import { Router } from "express";
import { statsController } from "../controllers";
import { auth } from "../middleware/auth";

const router = Router();

// Routes protégées (admin uniquement)
router.get("/dashboard", auth, statsController.getDashboardStats);
router.get("/tools", auth, statsController.getToolStats);
router.get("/users", auth, statsController.getUserStats);
router.get("/rentals", auth, statsController.getRentalStats);
router.get("/revenue", auth, statsController.getRevenueStats);
router.get("/categories", auth, statsController.getCategoryStats);

export default router;
