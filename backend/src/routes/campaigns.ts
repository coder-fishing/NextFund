import express from "express";
import { createCampaign, getCampaigns } from "../controllers/campaignController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyInternalRequest, createCampaign);
router.get("/", getCampaigns);

export default router;
