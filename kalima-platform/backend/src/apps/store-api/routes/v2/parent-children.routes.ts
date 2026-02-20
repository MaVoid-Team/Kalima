import { Router } from "express";
import { parentsController } from "../../controllers/parents.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";

const router = Router();

// PUBLIC
router.get("/", parentsController.getAllParentChildren);
router.get("/:id", parentsController.getParentChildById);

// AUTHENTICATED
router.post("/", authenticateToken, parentsController.createParentChild);
router.patch("/:id", authenticateToken, parentsController.updateParentChild);
router.delete("/:id", authenticateToken, parentsController.deleteParentChild);

export default router;
