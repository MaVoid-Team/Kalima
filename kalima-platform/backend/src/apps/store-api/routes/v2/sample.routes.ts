import { Router } from "express";
import { sampleController } from "../../controllers/sample.controller";

const router = Router();

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/", sampleController.getAllSamples);
router.get("/:id", sampleController.getSampleById);

export default router;
