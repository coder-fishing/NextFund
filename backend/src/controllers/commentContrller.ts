import { AuthRequest } from "../middleware/auth.js"
import { Response } from "express";
import Comment from "../models/Comment.js";

export const createComment = async (req: AuthRequest, res: Response) => {
    try {
        const { campaignId, content } = req.body;

        const comment = await Comment.create({
            userId: req.user!.id,
            campaignId,
            content,
        });

        const commnentsCount = await Comment.countDocuments({ campaignId });

        res.status(201).json({
            comment,
            commnentsCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating comment", error });
    }
}

export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const { campaignId } = req.params;
        const comments = await Comment.find({ campaignId })
            .sort({ createdAt: -1 })
            .populate("userId", "name avatar");
        res.json({ comments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error });
    }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        if (comment.userId.toString() !== req.user!.id) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        await comment.deleteOne();
        const commnentsCount = await Comment.countDocuments({ campaignId: comment.campaignId });
        res.json({
            message: "Comment deleted successfully",
            commnentsCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting comment", error });
    }
}

export const updateComment = async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        if (comment.userId.toString() !== req.user!.id) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        comment.content = content;
        await comment.save();
        res.json({
            message: "Comment updated successfully",
            comment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating comment", error });
    }
}