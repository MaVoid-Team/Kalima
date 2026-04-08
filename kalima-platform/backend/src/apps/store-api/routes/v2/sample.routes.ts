import { Router } from "express";
import { sampleSectionController } from "../../controllers/sample-section.controller";

const router = Router();

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/", sampleSectionController.getAllSamples);
router.get("/:sampleId", sampleSectionController.getSampleById);

export default router;
