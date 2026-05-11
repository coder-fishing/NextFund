import express from "express";
import {
  getAdminStats,
  getAllCampaignsForAdmin,
  getAllUsersForAdmin,
  getSystemSetting,
  updateSystemSetting,
  bulkModerateCampaigns,
} from "../controllers/adminController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", verifyInternalRequest, getAdminStats);
router.get("/campaigns", verifyInternalRequest, getAllCampaignsForAdmin);
router.post("/campaigns/bulk-moderate", verifyInternalRequest, bulkModerateCampaigns);
router.get("/users", verifyInternalRequest, getAllUsersForAdmin);
router.get("/settings/:key", verifyInternalRequest, getSystemSetting);
router.patch("/settings/:key", verifyInternalRequest, updateSystemSetting);

export default router;
