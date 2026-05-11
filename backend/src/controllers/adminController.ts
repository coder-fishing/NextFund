import { Response } from "express"
import User from "../models/User.js"
import Donation from "../models/Donation.js"
import { AuthRequest } from "../middleware/auth.js"
import SystemSetting from "../models/SystemSetting.js"
import Campaign from "../models/Campaign.js"
import { moderateCampaign } from "../services/moderationService.js"

// GET /api/admin/stats
export const getAdminStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Count campaigns by status
    const statusCounts = await Campaign.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    const statusMap: Record<string, number> = {}
    let totalCampaigns = 0
    for (const item of statusCounts) {
      statusMap[item._id] = item.count
      totalCampaigns += item.count
    }

    // Count campaigns that reached 100% goal
    const completedGoalCount = await Campaign.countDocuments({
      deletedAt: null,
      $expr: { $gte: ["$currentAmount", "$goalAmount"] },
    })

    // Total donations amount (sum of amountEth)
    const donationAgg = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalEth: { $sum: { $toDouble: "$amountEth" } },
          totalDonations: { $sum: 1 },
        },
      },
    ])

    const totalEth = donationAgg.length > 0 ? donationAgg[0].totalEth : 0
    const totalDonations =
      donationAgg.length > 0 ? donationAgg[0].totalDonations : 0

    // Calculate average goal achievement percentage
    const goalAchievementAgg = await Campaign.aggregate([
      { $match: { deletedAt: null, goalAmount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgPercentage: {
            $avg: {
              $multiply: [
                { $divide: ["$currentAmount", "$goalAmount"] },
                100,
              ],
            },
          },
        },
      },
    ])

    const avgGoalPercentage =
      goalAchievementAgg.length > 0
        ? Math.round(goalAchievementAgg[0].avgPercentage * 100) / 100
        : 0

    // Total users
    const totalUsers = await User.countDocuments()

    res.status(200).json({
      totalCampaigns,
      completedGoalCount,
      totalEth: Math.round(totalEth * 1e6) / 1e6,
      totalDonations,
      avgGoalPercentage,
      totalUsers,
      statusBreakdown: {
        pending: statusMap.pending ?? 0,
        approved: statusMap.approved ?? 0,
        rejected: statusMap.rejected ?? 0,
        active: statusMap.active ?? 0,
        completed: statusMap.completed ?? 0,
        cancelled: statusMap.cancelled ?? 0,
        manual: statusMap.manual ?? 0,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Error fetching admin stats", error })
  }
}

// GET /api/admin/campaigns?status=all|pending|approved|rejected&page=1&limit=10
export const getAllCampaignsForAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const statusFilter =
      typeof req.query.status === "string"
        ? req.query.status.trim().toLowerCase()
        : "all"

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const validStatuses = [
      "all",
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "cancelled",
      "manual",
    ]
    if (!validStatuses.includes(statusFilter)) {
      res.status(400).json({ message: "Invalid status filter" })
      return
    }

    const query: Record<string, unknown> =
      statusFilter === "all" ? {} : { status: statusFilter }

    const total = await Campaign.countDocuments(query)
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    res.status(200).json({
      campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching admin campaigns:", error)
    res
      .status(500)
      .json({ message: "Error fetching admin campaigns", error })
  }
}

// GET /api/admin/users?page=1&limit=10
export const getAllUsersForAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const total = await User.countDocuments()
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get campaign counts per creator email for the current batch of users
    const emails = users.map(u => u.email)
    const campaignCounts = await Campaign.aggregate([
      { $match: { deletedAt: null, creator: { $in: emails } } },
      { $group: { _id: "$creator", count: { $sum: 1 } } },
    ])

    const countMap: Record<string, number> = {}
    for (const item of campaignCounts) {
      countMap[item._id] = item.count
    }

    const usersWithStats = users.map((user) => ({
      ...user,
      campaignCount: countMap[user.email] ?? 0,
    }))

    res.status(200).json({
      users: usersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    res.status(500).json({ message: "Error fetching admin users", error })
  }
}

// GET /api/admin/settings/:key
export const getSystemSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const setting = await SystemSetting.findOne({ key });
    res.status(200).json({ setting });
  } catch (error) {
    res.status(500).json({ message: "Error fetching setting", error });
  }
}

// PATCH /api/admin/settings/:key
export const updateSystemSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Setting updated", setting });
  } catch (error) {
    res.status(500).json({ message: "Error updating setting", error });
  }
}

// POST /api/admin/campaigns/bulk-moderate
export const bulkModerateCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Process both pending and manual campaigns
    const pendingCampaigns = await Campaign.find({ 
      status: { $in: ["pending", "manual"] }, 
      deletedAt: null 
    })
    
    if (pendingCampaigns.length === 0) {
      res.status(200).json({ message: "No pending campaigns found", processed: 0 })
      return
    }

    let processedCount = 0
    let approvedCount = 0

    for (const campaign of pendingCampaigns) {
      const moderation = await moderateCampaign(campaign.title, campaign.description, campaign.goalAmount)
      
      campaign.status = moderation.status
      campaign.aiPrediction = moderation.aiPrediction
      await campaign.save()

      processedCount++
      if (moderation.status === "approved") approvedCount++
    }

    res.status(200).json({ 
      message: `Processed ${processedCount} campaigns. ${approvedCount} approved.`,
      processed: processedCount,
      approved: approvedCount
    })
  } catch (error) {
    console.error("Bulk moderation error:", error)
    res.status(500).json({ message: "Error during bulk moderation", error })
  }
}
