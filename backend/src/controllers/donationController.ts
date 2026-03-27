import { Response } from "express";
import { AuthRequest } from "./../middleware/auth.js";
import Donation from "./../models/Donation.js";
import Campaign from "./../models/Campaign.js";
import mongoose from "mongoose";

export const donate = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, amount, txHash, walletAddress } = req.body;

    // check trùng tx
    const exist = await Donation.findOne({ txHash });
    if (exist) {
      return res.status(400).json({
        message: "Transaction already recorded"
      });
    }

    // lưu donation
    const donation = await Donation.create({
      userId: req.user!.id,
      campaignId,
      amount,
      txHash,
      walletAddress
    });

    // cập nhật tiền campaign
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { currentAmount: amount }
    });

    res.json(donation);

  } catch (error) {
    res.status(500).json({ message: "Error donate", error });
  }
};



// Lấy danh sách donate theo campaign
export const getDonationsByCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    const donations = await Donation.find({ campaignId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(donations);

  } catch (error) {
    res.status(500).json({ message: "Error get donations", error });
  }
};


// Tổng tiền donate
export const getTotalDonation = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    const result = await Donation.aggregate([
      {
        $match: {
          campaignId: new mongoose.Types.ObjectId(campaignId as string)
        }
      },
      {
        $group: {
          _id: "$campaignId",
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      total: result[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: "Error total donation", error });
  }
};