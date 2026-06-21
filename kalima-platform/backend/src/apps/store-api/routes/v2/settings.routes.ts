import { Router } from "express";
import { whatsappController } from "../../controllers/whatsapp.controller";

const router = Router();

router.get("/contact", whatsappController.getPublicContact);

export default router;
