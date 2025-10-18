import { Router } from "express";
import * as statsController from "../controllers/statsController";

const router = Router();

router.get("/cash-flow", statsController.getCashFlowSummary);

export default router;
