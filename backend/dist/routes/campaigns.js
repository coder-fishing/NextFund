import express from "express";
import { createCampaign } from "../controllers/campaignController.js";
import { verifyInternalRequest } from "../middleware/auth.js";
const router = express.Router();
router.post("/", verifyInternalRequest, createCampaign);
export default router;
//# sourceMappingURL=campaigns.js.map