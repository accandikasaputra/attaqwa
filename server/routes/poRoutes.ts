import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { canApproveBendahara, canApproveKetua } from "../middleware/auth";
import * as poController from "../controllers/poController";

const router = Router();

router.get("/", authMiddleware, poController.getAllPOs);
router.get("/:id", authMiddleware, poController.getPOById);
router.post("/", authMiddleware, poController.createPO);
router.put("/:id/input-price", authMiddleware, poController.inputPrice);
router.put("/:id/submit", authMiddleware, poController.submitPO);
router.put("/:id/review-bendahara", authMiddleware, canApproveBendahara, poController.reviewByBendahara);
router.put("/:id/approve-ketua", authMiddleware, canApproveKetua, poController.approveByKetua);
router.delete("/:id", authMiddleware, poController.deletePO);

export default router;
