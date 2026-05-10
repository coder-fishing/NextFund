import express from "express";
import {
  getAdminStats,
  getAllCampaignsForAdmin,
  getAllUsersForAdmin,
} from "../controllers/adminController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", verifyInternalRequest, getAdminStats);
router.get("/campaigns", verifyInternalRequest, getAllCampaignsForAdmin);
router.get("/users", verifyInternalRequest, getAllUsersForAdmin);

export default router;
