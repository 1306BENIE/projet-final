import express from "express";
import userRoutes from "./userRoutes";
import toolRoutes from "./toolRoutes";
import rentalRoutes from "./rentalRoutes";
import reviewRoutes from "./reviewRoutes";
import adminRoutes from "./adminRoutes";
import searchRoutes from "./searchRoutes";
import recommendationRoutes from "./recommendationRoutes";
import notificationRoutes from "./notificationRoutes";
import categoryRoutes from "./categoryRoutes";
import paymentRoutes from "./paymentRoutes";
import statsRoutes from "./statsRoutes";
import reportRoutes from "./reportRoutes";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/tools", toolRoutes);
router.use("/rentals", rentalRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/search", searchRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/categories", categoryRoutes);
router.use("/payments", paymentRoutes);
router.use("/stats", statsRoutes);
router.use("/reports", reportRoutes);

export default router;
