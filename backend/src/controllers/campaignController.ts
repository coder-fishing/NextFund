import { Response } from "express";
import Campaign from "../models/Campaign.js";
import { AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

interface CreateCampaignBody {
  title?: string;
  description?: string;
  category?: string;
  goalAmount?: number;
  endDate?: string;
  image?: string[];
  receiveWalletAddress?: string;
}

const allowedCategories = new Set([
  "medical",
  "education",
  "emergency",
  "animals",
  "community",
  "general",
]);

// Create

export const createCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, goalAmount, endDate, image, receiveWalletAddress } =
      req.body as CreateCampaignBody;

    if (!title || !description || !goalAmount || !endDate || !receiveWalletAddress) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (Number(goalAmount) <= 0) {
      res.status(400).json({ message: "goalAmount must be greater than 0" });
      return;
    }

    const parsedEndDate = new Date(endDate);
    if (Number.isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ message: "Invalid endDate" });
      return;
    }

    const creator = req.user?.email;
    if (!creator) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const user = await User.findOne({ email: creator }).select("_id");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const normalizedReceiveWalletAddress = receiveWalletAddress.trim().toLowerCase();
    const userWallet = await Wallet.findOne({
      userId: user._id,
      address: normalizedReceiveWalletAddress,
    }).select("_id");

    if (!userWallet) {
      res.status(403).json({ message: "Selected wallet does not belong to this user" });
      return;
    }

    const normalizedCategory = (category ?? "general").trim().toLowerCase();
    if (!allowedCategories.has(normalizedCategory)) {
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    const campaign = await Campaign.create({
      title,
      description,
      category: normalizedCategory,
      goalAmount: Number(goalAmount),
      endDate: parsedEndDate,
      image: Array.isArray(image) ? image : [],
      creator,
      receiveWalletAddress: normalizedReceiveWalletAddress,
      status: "approved",
    });

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: "Error creating campaign", error });
  }
};

// Read

export const getCampaigns = async (_req: AuthRequest | null, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json({ campaigns });
    } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Error fetching campaigns", error });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) {
        res.status(404).json({ message: "Campaign not found" });
        return;
    }
    res.status(200).json({ campaign });
    } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Error fetching campaign", error });
  }
};

export const getCampaignByUserEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            res.status(401).json({ message: "Invalid token payload" });
            return;
        }
        const campaigns = await Campaign.find({ creator: userEmail });
        res.status(200).json({ campaigns });
    } catch (error) {
        console.error("Error fetching user's campaigns:", error);
        res.status(500).json({ message: "Error fetching user's campaigns", error });
    }
};

export const getApprovedCampaigns = async (_req: AuthRequest | null, res: Response): Promise<void> => {
    try {
    const categoryQuery = _req?.query?.category;
    let categoryFilter: string | undefined;

    if (typeof categoryQuery === "string" && categoryQuery.trim() !== "") {
      const normalizedCategory = categoryQuery.trim().toLowerCase();
      if (!allowedCategories.has(normalizedCategory)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }
      categoryFilter = normalizedCategory;
    }

    const campaigns = await Campaign.find({
      status: "approved",
      ...(categoryFilter ? { category: categoryFilter } : {}),
    });
        res.status(200).json({ campaigns });
    } catch (error) {
        console.error("Error fetching approved campaigns:", error);
        res.status(500).json({ message: "Error fetching approved campaigns", error });
    }
};

export const getCampaignWithStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    if (
      typeof status !== "string" ||
      !["pending", "approved", "rejected"].includes(status)
    ) {
      res.status(400).json({ message: "Invalid or missing status" });
      return;
    }

    const campaigns = await Campaign.find({ status });

    res.status(200).json({ campaigns });

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      message: "Error fetching campaigns",
      error
    });
  }
};

// Update

export const updateCampaignStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["pending", "approved", "rejected"].includes(status)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }
        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { status },
          { returnDocument: 'after' }
        );
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" });
            return;
        }
        res.status(200).json({ message: "Campaign status updated", campaign });
    } catch (error) {
        console.error("Error updating campaign status:", error);
        res.status(500).json({ message: "Error updating campaign status", error });
    }
};

// Delete

export const deleteCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByIdAndDelete(id);
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" });
            return;
        }
        res.status(200).json({ message: "Campaign deleted" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ message: "Error deleting campaign", error });
    }
};

