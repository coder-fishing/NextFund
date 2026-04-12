import express from "express";
import { createComment, getComments, deleteComment, updateComment } from "../controllers/commentContrller.js";
import { verifyJWTRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyJWTRequired, createComment);
router.get("/:campaignId", getComments);
router.delete("/:commentId", verifyJWTRequired, deleteComment);
router.put("/:commentId", verifyJWTRequired, updateComment);

export default router;