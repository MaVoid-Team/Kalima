import { Router } from "express";
import { teachersController } from "../../controllers/teachers.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";

const router = Router();

// PUBLIC
router.get("/", teachersController.getAllTeachesAt);
router.get("/:id", teachersController.getTeachesAtById);

// AUTHENTICATED - mixed permissions enforced in controller
router.post("/", authenticateToken, teachersController.createTeachesAt);
router.patch("/:id", authenticateToken, teachersController.updateTeachesAt);
router.delete("/:id", authenticateToken, teachersController.deleteTeachesAt);

export default router;
