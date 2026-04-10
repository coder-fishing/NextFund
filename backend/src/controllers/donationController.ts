import { Response } from "express";
import { AuthRequest } from "./../middleware/auth.js";
import Donation from "./../models/Donation.js";
import Campaign from "./../models/Campaign.js";
import mongoose from "mongoose";
import { ethers } from "ethers";

const donationInterface = new ethers.Interface([
  "function donate(address receiver, uint256 campaignId) payable",
  "event DonationSent(address indexed donor,address indexed receiver,uint256 indexed campaignId,uint256 amount,uint256 timestamp)",
]);

const toOnChainCampaignId = (campaignId: string): bigint => {
  if (!/^[a-fA-F0-9]{24}$/.test(campaignId)) {
    throw new Error("Invalid campaign id format");
  }

  return BigInt(`0x${campaignId}`);
};

export const donate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId, txHash, walletAddress } = req.body as {
      campaignId?: string;
      txHash?: string;
      walletAddress?: string;
    };

    if (!campaignId || !txHash) {
      res.status(400).json({
        message: "campaignId and txHash are required",
      });
      return;
    }

    const normalizedTxHash = txHash.trim().toLowerCase();
    const normalizedWalletAddress = walletAddress?.trim().toLowerCase();

    const rpcUrl = process.env.RPC_URL_SEPOLIA;
    const donationContractAddress = process.env.DONATION_CONTRACT_ADDRESS;

    if (!rpcUrl || !donationContractAddress) {
      res.status(500).json({
        message: "RPC_URL_SEPOLIA or DONATION_CONTRACT_ADDRESS is not configured",
      });
      return;
    }

    const campaign = await Campaign.findById(campaignId).select("receiveWalletAddress currentAmount");
    if (!campaign) {
      res.status(404).json({
        message: "Campaign not found",
      });
      return;
    }

    // check trùng tx
    const exist = await Donation.findOne({ txHash: normalizedTxHash });
    if (exist) {
      res.status(400).json({
        message: "Transaction already recorded"
      });
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tx = await provider.getTransaction(normalizedTxHash);
    const receipt = await provider.getTransactionReceipt(normalizedTxHash);

    if (!tx || !receipt) {
      res.status(400).json({
        message: "Transaction not found on chain",
      });
      return;
    }

    if (receipt.status !== 1) {
      res.status(400).json({
        message: "Transaction failed on chain",
      });
      return;
    }

    if (!tx.to || tx.to.toLowerCase() !== donationContractAddress.toLowerCase()) {
      res.status(400).json({
        message: "Transaction sent to wrong contract",
      });
      return;
    }

    if (normalizedWalletAddress && tx.from.toLowerCase() !== normalizedWalletAddress) {
      res.status(400).json({
        message: "walletAddress mismatch with tx sender",
      });
      return;
    }

    const parsedTx = donationInterface.parseTransaction({
      data: tx.data,
      value: tx.value,
    });

    if (!parsedTx || parsedTx.name !== "donate") {
      res.status(400).json({
        message: "Wrong transaction method",
      });
      return;
    }

    const onChainReceiver = String(parsedTx.args[0]).toLowerCase();
    const onChainCampaignId = BigInt(parsedTx.args[1].toString());
    const expectedReceiver = String(campaign.receiveWalletAddress).toLowerCase();
    const expectedCampaignId = toOnChainCampaignId(campaignId);

    if (onChainReceiver !== expectedReceiver) {
      res.status(400).json({
        message: "Receiver wallet mismatch",
      });
      return;
    }

    if (onChainCampaignId !== expectedCampaignId) {
      res.status(400).json({
        message: "campaignId mismatch",
      });
      return;
    }

    const amountWei = tx.value.toString();
    const amountEth = ethers.formatEther(tx.value);

    const donationEvent = donationInterface.getEvent("DonationSent");
    if (!donationEvent) {
      res.status(500).json({ message: "Donation event definition missing" });
      return;
    }
    const eventTopic = donationEvent.topicHash;

    const matchedLog = receipt.logs.find(
      (log) =>
        log.topics?.[0]?.toLowerCase() === eventTopic.toLowerCase() &&
        log.address.toLowerCase() === donationContractAddress.toLowerCase()
    );

    const logIndex = matchedLog?.index ?? 0;
    const blockNumber = receipt.blockNumber;

    // lưu donation
    const donation = await Donation.create({
      userId: req.user!.id,
      campaignId,
      campaignIdOnChain: onChainCampaignId.toString(),
      amountWei,
      amountEth,
      txHash: normalizedTxHash,
      walletAddress: tx.from.toLowerCase(),
      logIndex,
      blockNumber,
    });

    // cập nhật tiền campaign
    const amountEthNumber = Number(amountEth);
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { currentAmount: amountEthNumber }
    });

    res.json(donation);
    return;

  } catch (error) {
    res.status(500).json({ message: "Error donate", error });
    return;
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

    const donations = await Donation.find({
      campaignId: new mongoose.Types.ObjectId(campaignId as string),
    }).select("amountWei");

    const totalWei = donations.reduce((sum, item) => {
      return sum + BigInt(item.amountWei || "0");
    }, 0n);

    res.json({
      totalWei: totalWei.toString(),
      totalEth: ethers.formatEther(totalWei),
    });

  } catch (error) {
    res.status(500).json({ message: "Error total donation", error });
  }
};