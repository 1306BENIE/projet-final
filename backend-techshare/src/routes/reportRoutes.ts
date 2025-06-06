import { Router } from "express";
import { reportController } from "../controllers";
import { auth } from "../middleware/auth";

const router = Router();

// Routes protégées (admin uniquement)
router.get("/security-logs", auth, reportController.getSecurityLogs);
router.get("/activity-logs", auth, reportController.getActivityLogs);
router.get("/error-logs", auth, reportController.getErrorLogs);
router.get("/user-activity/:userId", auth, reportController.getUserActivity);
router.get("/tool-activity/:toolId", auth, reportController.getToolActivity);

export default router;
