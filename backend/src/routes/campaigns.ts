import express from "express";
import {
	createCampaign,
	deleteCampaign,
	getApprovedCampaigns,
	getCampaignById,
	getCampaignByUserEmail,
	getCampaigns,
} from "../controllers/campaignController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyInternalRequest, createCampaign);
router.get("/me", verifyInternalRequest, getCampaignByUserEmail);
router.get("/approved", getApprovedCampaigns);
router.delete("/:id", verifyInternalRequest, deleteCampaign);
router.get("/:id", getCampaignById);
router.get("/", getCampaigns);

export default router;
