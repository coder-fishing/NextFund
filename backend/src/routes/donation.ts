import express from "express";
import { donate, getDonationsByCampaign, getTotalDonation } from "../controllers/donationController.js";
import { verifyJWTRequired } from "./../middleware/auth.js";

const router = express.Router();

router.post("/", verifyJWTRequired, donate);

// lấy list donate
router.get("/:campaignId",verifyJWTRequired, getDonationsByCampaign);

// tổng tiền
router.get("/total/:campaignId", verifyJWTRequired, getTotalDonation);

export default router;