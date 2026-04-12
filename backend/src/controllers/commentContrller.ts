import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";
import Comment from "../models/Comment.js";

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, content } = req.body as {
      campaignId?: string;
      content?: string;
    };

    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const normalizedContent = String(content ?? "").trim();

    if (!campaignId || !normalizedContent) {
      res.status(400).json({ message: "campaignId and content are required" });
      return;
    }

    const comment = await Comment.create({
      userId: req.user.id,
      campaignId,
      content: normalizedContent,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "name avatar"
    );

    const commentsCount = await Comment.countDocuments({ campaignId });

    res.status(201).json({
      comment: populatedComment ?? comment,
      commentsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(20, Number(req.query.limit) || 5));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ campaignId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar"),
      Comment.countDocuments({ campaignId }),
    ]);

    res.json({
      comments,
      page,
      limit,
      total,
      hasMore: skip + comments.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== req.user.id) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await comment.deleteOne();
    const commentsCount = await Comment.countDocuments({ campaignId: comment.campaignId });

    res.json({
      message: "Comment deleted successfully",
      commentsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body as { content?: string };

    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const normalizedContent = String(content ?? "").trim();
    if (!normalizedContent) {
      res.status(400).json({ message: "Content is required" });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== req.user.id) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    comment.content = normalizedContent;
    await comment.save();

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
};