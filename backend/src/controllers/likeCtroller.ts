import { Response } from "express";
import { AuthRequest } from "./../middleware/auth.js";
import Like from "../models/Like.js";

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.body;

    const existing = await Like.findOne({
      userId: req.user!.id,
      campaignId,
    });

    let liked;

    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({
        userId: req.user!.id,
        campaignId,
      });
      liked = true;
    }

    const likeCount = await Like.countDocuments({ campaignId });

    res.json({
      liked,
      likeCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggle like", error });
  }
};
