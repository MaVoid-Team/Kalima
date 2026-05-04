import { Router } from "express";
import { appreciationController } from "../../controllers/appreciation.controller";

const router = Router();

router.get("/:token", appreciationController.getPublicPage);
router.post("/:token/comments", appreciationController.createComment);

export default router;
