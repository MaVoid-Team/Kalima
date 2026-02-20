import { Router } from "express";
import { teachersController } from "../../controllers/teachers.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";

const router = Router();

// PUBLIC reads
router.get("/", teachersController.getAllSocialMedia);
router.get("/:id", teachersController.getSocialMediaById);

// AUTHENTICATED — mixed permissions handled inside controller
router.post("/", authenticateToken, teachersController.createSocialMedia);
router.patch("/:id", authenticateToken, teachersController.updateSocialMedia);
router.delete("/:id", authenticateToken, teachersController.deleteSocialMedia);

export default router;
