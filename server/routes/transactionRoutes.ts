import { Router } from "express";
import { isAuthenticated, canCreateTransaction, canApproveBendahara, canApproveKetua } from "../middleware/auth";
import * as transactionController from "../controllers/transactionController";

const router = Router();

router.get("/", isAuthenticated, transactionController.getAllTransactions);
router.get("/status/:status", isAuthenticated, transactionController.getTransactionsByStatus);
router.post("/", canCreateTransaction, transactionController.createTransaction);
router.post("/:id/approve-bendahara", isAuthenticated, canApproveBendahara, transactionController.approveBendahara);
router.post("/:id/approve-ketua", isAuthenticated, canApproveKetua, transactionController.approveKetua);

export default router;
