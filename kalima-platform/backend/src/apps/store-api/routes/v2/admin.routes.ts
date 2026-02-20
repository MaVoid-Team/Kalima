import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
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
// USER MANAGEMENT
// ============================================

// List / search users
router.get("/users", ...adminAuth, adminController.listUsers);

// Get single user with all roles
router.get("/users/:userId", ...adminAuth, adminController.getUser);

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

export default router;
