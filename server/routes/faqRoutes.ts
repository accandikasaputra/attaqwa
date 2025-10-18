import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import * as faqController from "../controllers/faqController";

const router = Router();

router.get("/", faqController.getActiveFAQs);
router.get("/all", isAuthenticated, faqController.getAllFAQs);
router.get("/:id", faqController.getFAQById);
router.post("/", isAuthenticated, faqController.createFAQ);
router.put("/reorder", isAuthenticated, faqController.reorderFAQs);
router.put("/:id", isAuthenticated, faqController.updateFAQ);
router.delete("/:id", isAuthenticated, faqController.deleteFAQ);

export default router;
