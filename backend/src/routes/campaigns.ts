import express from "express";
import {
	createCampaign,
	getApprovedCampaigns,
	getCampaignById,
	getCampaigns,
} from "../controllers/campaignController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyInternalRequest, createCampaign);
router.get("/approved", getApprovedCampaigns);
router.get("/:id", getCampaignById);
router.get("/", getCampaigns);

export default router;
