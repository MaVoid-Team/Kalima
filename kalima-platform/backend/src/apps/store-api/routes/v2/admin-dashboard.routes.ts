import { Router } from "express";
import { adminDashboardController } from "../../controllers/admin-dashboard.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";

const router = Router();

// All admin routes require authentication + Admin or SubAdmin role
const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// STORE ANALYTICS
// ============================================

// Overview, Monthly Trends, Daily stats
router.get("/store-stats", ...adminAuth, adminDashboardController.getStoreStatistics);

// Confirmer Statistics
router.get("/confirmer-stats", ...adminAuth, adminDashboardController.getConfirmerStatistics);

// Product Performance Ranking
router.get("/product-performance", ...adminAuth, adminDashboardController.getProductPerformance);

// Response Time Analytics
router.get("/response-time", ...adminAuth, adminDashboardController.getResponseTimeAnalytics);

export default router;
