import { Router } from "express";
import { isAdmin } from "../middleware/auth";
import * as bankAccountController from "../controllers/bankAccountControllers";

const router = Router();

router.get("/", bankAccountController.getActiveBankAccounts);
router.get("/all", isAdmin, bankAccountController.getAllBankAccounts);
router.post("/", isAdmin, bankAccountController.createBankAccount);

export default router;
