import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import * as feedbackController from "../controllers/feedbackControllers";

const router = Router();

router.get("/", isAuthenticated, feedbackController.getAllFeedback);
router.get("/:id", isAuthenticated, feedbackController.getFeedbackById);
router.post("/", feedbackController.createFeedback);
router.put("/:id/read", isAuthenticated, feedbackController.markAsRead);
router.put("/:id/reply", isAuthenticated, feedbackController.replyFeedback);
router.delete("/:id", isAuthenticated, feedbackController.deleteFeedback);

export default router;
