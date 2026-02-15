import { Router } from "express";
import { authController } from "../../controllers/auth.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";

const router = Router();

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// Registration - Local
router.post("/register/teacher", authController.registerTeacher);
router.post("/register/student", authController.registerStudent);
router.post("/register/parent", authController.registerParent);
router.post("/register/lecturer", authController.registerLecturer);

// Registration - Firebase OAuth
router.post(
  "/register/teacher/firebase",
  authController.registerTeacherFirebase,
);
router.post(
  "/register/student/firebase",
  authController.registerStudentFirebase,
);
router.post("/register/parent/firebase", authController.registerParentFirebase);
router.post(
  "/register/lecturer/firebase",
  authController.registerLecturerFirebase,
);

// Login
router.post("/login", authController.login);
router.post("/login/firebase", authController.loginFirebase);

// Token Management (Public)
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Password Recovery (Public)
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Email Verification (Public)
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// Logout from all devices
router.post("/logout-all", authenticateToken, authController.logoutAllDevices);

// Password Management (Protected)
router.post(
  "/change-password",
  authenticateToken,
  authController.changePassword,
);
router.post("/set-password", authenticateToken, authController.setPassword);

// Email Verification (Protected - for logged in users)
router.post(
  "/send-verification",
  authenticateToken,
  authController.sendVerificationEmail,
);

// Account Linking (Protected)
router.post(
  "/link/firebase",
  authenticateToken,
  authController.linkFirebaseAccount,
);
router.post("/unlink", authenticateToken, authController.unlinkProvider);
router.get(
  "/linked-providers",
  authenticateToken,
  authController.getLinkedProviders,
);

// ============================================
// ADMIN ROUTES - Admin authentication required
// ============================================

router.post(
  "/admin/create-admin",
  authenticateToken,
  authController.createAdmin,
);
router.post(
  "/admin/create-subadmin",
  authenticateToken,
  authController.createSubAdmin,
);
router.post(
  "/admin/create-moderator",
  authenticateToken,
  authController.createModerator,
);
router.post(
  "/admin/create-assistant",
  authenticateToken,
  authController.createAssistant,
);

export default router;
