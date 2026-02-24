import { Router } from "express";
import { sampleController } from "../../controllers/sample.controller";
import { makeExportHandler } from "../../export";

const router = Router();

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/export", makeExportHandler("samples"));
router.get("/", sampleController.getAllSamples);
router.get("/:id", sampleController.getSampleById);

export default router;
