import { Router } from "express";
import { isAuthenticated, canApproveBendahara, canApproveKetua } from "../middleware/auth";
import * as donationController from "../controllers/donationController";

const router = Router();

router.get("/", isAuthenticated, donationController.getAllDonations);
router.get("/:id", isAuthenticated, donationController.getDonationById);
router.post("/", isAuthenticated, donationController.createDonation);
router.put("/:id", isAuthenticated, donationController.updateDonation);
router.put("/:id/submit", isAuthenticated, donationController.submitDonation);
router.put("/:id/review-bendahara", canApproveBendahara, donationController.reviewByBendahara);
router.put("/:id/approve-ketua", isAuthenticated, canApproveKetua, donationController.approveByKetua);
router.delete("/:id", isAuthenticated, donationController.deleteDonation);

export default router;
