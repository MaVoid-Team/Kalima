import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
import { adminUserStatsController } from "../../controllers/admin-user-stats.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

// All admin routes require authentication + Admin or SubAdmin role
const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

const adminModeratorAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

// ============================================
// USER MANAGEMENT
// ============================================

// ============================================
// ACCOUNT REVIEW
// ============================================

router.get("/account-review-settings", ...adminAuth, adminController.getAccountReviewSettings);
router.put("/account-review-settings", ...adminAuth, adminController.upsertAccountReviewSettings);

// Create user (respects privilege matrix)
router.post("/users", ...adminAuth, adminController.createUser);

// Create specific user types
router.post("/teachers", ...adminAuth, adminController.createTeacher);
router.post("/students", ...adminAuth, adminController.createStudent);
router.post("/parents", ...adminAuth, adminController.createParent);
router.post("/lecturers", ...adminAuth, adminController.createLecturer);

// Export users
router.get("/users/export", ...adminAuth, makeExportHandler("users"));

// List / search users
router.get("/users", ...adminModeratorAuth, adminController.listUsers);

// Created Accounts Statistics
router.get(
  "/users/stats/created-accounts",
  ...adminAuth,
  adminUserStatsController.getCreatedAccountsStats,
);

// Get single user with all roles
router.get("/users/:userId", ...adminModeratorAuth, adminController.getUser);
router.patch(
  "/users/:userId/flag",
  ...adminModeratorAuth,
  adminController.updateUserFlag,
);

// Account review: approve / reject users (must be before :userId/roles to avoid conflict)
router.post("/users/:userId/approve", ...adminAuth, adminController.approveUser);
router.post("/users/:userId/reject", ...adminAuth, adminController.rejectUser);

// ============================================
// ROLE MANAGEMENT
// ============================================

// Get user roles
router.get("/users/:userId/roles", ...adminAuth, adminController.getUserRoles);

// Assign a new role to a user
router.post("/users/:userId/roles", ...adminAuth, adminController.assignRole);

// Replace all roles for a user
router.put("/users/:userId/roles", ...adminAuth, adminController.setRoles);

// Revoke a role from a user
router.delete("/users/:userId/roles", ...adminAuth, adminController.revokeRole);

// Delete a user
router.delete("/users/:userId", ...adminAuth, adminController.deleteUser);

export default router;
