import { Router } from "express";
import * as cashFlowController from "../controllers/cashFlowController";

const router = Router();

router.get("/statistics", cashFlowController.getStatistics);
router.get("/", cashFlowController.getCashFlowList);

export default router;
