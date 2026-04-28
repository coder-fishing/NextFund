import { Response } from "express"
import Campaign from "../models/Campaign.js"
import { AuthRequest } from "../middleware/auth.js"
import User from "../models/User.js"
import Wallet from "../models/Wallet.js"
import Donation from "../models/Donation.js"

interface CreateCampaignBody {
  title?: string
  description?: string
  category?: string
  goalAmount?: number
  endDate?: string
  image?: string[]
  receiveWalletAddress?: string
}

const allowedCategories = new Set([
  "medical",
  "education",
  "emergency",
  "animals",
  "community",
  "general",
])

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Create

export const createCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, goalAmount, endDate, image, receiveWalletAddress } =
      req.body as CreateCampaignBody

    if (!title || !description || !goalAmount || !endDate || !receiveWalletAddress) {
      res.status(400).json({ message: "Missing required fields" })
      return
    }

    if (Number(goalAmount) <= 0) {
      res.status(400).json({ message: "goalAmount must be greater than 0" })
      return
    }

    const parsedEndDate = new Date(endDate)
    if (Number.isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ message: "Invalid endDate" })
      return
    }

    const creator = req.user?.email
    if (!creator) {
      res.status(401).json({ message: "Invalid token payload" })
      return
    }

    const user = await User.findOne({ email: creator }).select("_id")

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    const normalizedReceiveWalletAddress = receiveWalletAddress.trim().toLowerCase()
    const userWallet = await Wallet.findOne({
      userId: user._id,
      address: normalizedReceiveWalletAddress,
    }).select("_id")

    if (!userWallet) {
      res.status(403).json({ message: "Selected wallet does not belong to this user" })
      return
    }

    const normalizedCategory = (category ?? "general").trim().toLowerCase()
    if (!allowedCategories.has(normalizedCategory)) {
      res.status(400).json({ message: "Invalid category" })
      return
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
    })

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    })
  } catch (error) {
    console.error("Error creating campaign:", error)
    res.status(500).json({ message: "Error creating campaign", error })
  }
}

// Read

export const getCampaigns = async (_req: AuthRequest | null, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find({ deletedAt: null })
    res.status(200).json({ campaigns })
    } catch (error) {
    console.error("Error fetching campaigns:", error)
    res.status(500).json({ message: "Error fetching campaigns", error })
  }
}

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const campaign = await Campaign.findOne({ _id: id, deletedAt: null })
    if (!campaign) {
        res.status(404).json({ message: "Campaign not found" })
        return
    }
    res.status(200).json({ campaign })
    } catch (error) {
    console.error("Error fetching campaign:", error)
    res.status(500).json({ message: "Error fetching campaign", error })
  }
}

export const getCampaignByUserEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userEmail = req.user?.email
        if (!userEmail) {
            res.status(401).json({ message: "Invalid token payload" })
            return
        }

        const filter =
          typeof req.query.filter === "string"
            ? req.query.filter.trim().toLowerCase()
            : "all"

        if (!["all", "active", "expired", "deleted"].includes(filter)) {
          res.status(400).json({ message: "Invalid filter" })
          return
        }

        const now = new Date()
        const query: Record<string, unknown> = { creator: userEmail }

        if (filter === "deleted") {
          query.deletedAt = { $ne: null }
        } else if (filter === "active") {
          query.deletedAt = null
          query.endDate = { $gte: now }
        } else if (filter === "expired") {
          query.deletedAt = null
          query.endDate = { $lt: now }
        }

        const campaigns = await Campaign.find(query).sort({ createdAt: -1 })
        res.status(200).json({ campaigns })
    } catch (error) {
        console.error("Error fetching user's campaigns:", error)
        res.status(500).json({ message: "Error fetching user's campaigns", error })
    }
}

export const getApprovedCampaigns = async (_req: AuthRequest | null, res: Response): Promise<void> => {
    try {
    const categoryQuery = _req?.query?.category
    const searchQuery = _req?.query?.search
    let categoryFilter: string | undefined
    let searchFilter: string | undefined

    if (typeof categoryQuery === "string" && categoryQuery.trim() !== "") {
      const normalizedCategory = categoryQuery.trim().toLowerCase()
      if (!allowedCategories.has(normalizedCategory)) {
        res.status(400).json({ message: "Invalid category" })
        return;
      }
      categoryFilter = normalizedCategory;
    }

    if (typeof searchQuery === "string" && searchQuery.trim() !== "") {
      searchFilter = escapeRegExp(searchQuery.trim())
    }

    const query: Record<string, unknown> = {
      status: "approved",
      deletedAt: null,
      ...(categoryFilter ? { category: categoryFilter } : {}),
    }

    if (searchFilter) {
      query.$or = [
        { title: { $regex: searchFilter, $options: "i" } },
        { description: { $regex: searchFilter, $options: "i" } },
      ]
    }

    const campaigns = await Campaign.find(query);
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
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const campaign = await Campaign.findOne({ _id: id, creator: userEmail });
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" });
            return;
        }

    if (campaign.deletedAt) {
      res.status(400).json({ message: "Campaign already deleted" });
      return;
    }

    campaign.deletedAt = new Date();
    await campaign.save();

    res.status(200).json({ message: "Campaign deleted" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ message: "Error deleting campaign", error });
    }
};

// Export

export const exportCampaignsStatement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userEmail = req.user?.email
        const { campaignId } = req.params
    const format = String(req.query.format ?? "csv").toLowerCase().trim()
        
        if (!userEmail) {
            res.status(401).json({ message: "Invalid user context" })
            return
        }

    if (format !== "csv") {
      res.status(400).json({ message: "Only csv format is supported" })
            return
        }

        const campaign = await Campaign.findOne({ _id: campaignId, creator: userEmail, deletedAt: null })
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" })
            return
        }

        const donations = await Donation.find({ campaignId: campaign._id })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .lean()

        const rows = donations.map((d: any, idx) => ({
            stt: idx + 1,
            donorName: d?.userId?.name ?? "Anonymous",
            donorEmail: d?.userId?.email ?? "",
            walletAddress: d.walletAddress ?? "",
            amountEth: d.amountEth ?? "0",
            txHash: d.txHash ?? "",
            donatedAt: d.createdAt
              ? new Date(d.createdAt).toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
              : "",
        }))

        const uniqueDonorKeys = new Set(
          donations.map((d: any) => String(d?.userId?._id ?? d.walletAddress ?? ""))
        )
        const uniqueDonorsCount = Array.from(uniqueDonorKeys).filter(Boolean).length

        const totalAmountEth = donations
          .reduce((sum: number, d: any) => sum + Number(d?.amountEth ?? "0"), 0)
          .toFixed(6)

        const delimiter = ";"
        const generatedAt = new Date().toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })

        const escapeCsv = (value: string): string => {
          const safe = String(value ?? "").replace(/\r?\n/g, " ")
          if (safe.includes(delimiter) || safe.includes('"')) {
            return `"${safe.replace(/"/g, '""')}"`
          }
          return safe
        }

        const header = ["STT", "Donor Name", "Email", "Wallet Address", "Amount (ETH)", "Transaction Hash", "Donated At"]
        const lines: string[][] = [
          ["sep=;"],
          ["Statement", campaign.title ?? ""],
          ["Generated Date", generatedAt],
          ["Total Donations", String(rows.length)],
          [],
          header,
          ...rows.map((row) => [
            String(row.stt),
            row.donorName,
            row.donorEmail,
            row.walletAddress,
            row.amountEth,
            row.txHash,
            row.donatedAt,
          ]),
          [],
          ["Total Unique Donors", String(uniqueDonorsCount)],
          ["Total Amount Donated (ETH)", totalAmountEth],
        ]

        const csvBody = lines
          .map((line) => line.map((cell) => escapeCsv(String(cell))).join(delimiter))
          .join("\r\n")

        const csv = `\uFEFF${csvBody}`

        const fileName = `campaign-${campaign._id}-statement.csv`
        res.setHeader("Content-Type", "text/csv; charset=utf-8")
        res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`)
        res.send(Buffer.from(csv, "utf-8"))
        return

    } catch (error) {
        console.error("Error exporting campaign statement:", error)
        res.status(500).json({ message: "Error exporting campaign statement", error })
    }
}