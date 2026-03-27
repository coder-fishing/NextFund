import express from "express";
import { createComment, getComments, deleteComment, updateComment } from "../controllers/commentContrller.js";

const router = express.Router();
router.post("/", createComment);
router.get("/:campaignId", getComments);
router.delete("/:commentId", deleteComment);
router.put("/:commentId", updateComment);

export default router;