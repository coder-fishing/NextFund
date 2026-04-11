import { ethers } from "ethers";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import SyncState from "../models/SyncState.js";

const SYNC_KEY = "donation_indexer";
const donationInterface = new ethers.Interface([
  "event DonationSent(address indexed donor,address indexed receiver,uint256 indexed campaignId,uint256 amount,uint256 timestamp)",
]);

let running = false;
let cooldownUntil = 0;

const toMongoCampaignId = (campaignIdOnChain: bigint): string | null => {
  const hex = campaignIdOnChain.toString(16).toLowerCase();
  if (hex.length > 24) return null;
  return hex.padStart(24, "0");
};

const getConfig = () => {
  const rpcUrl = process.env.RPC_URL_SEPOLIA;
  const contractAddress = process.env.DONATION_CONTRACT_ADDRESS?.toLowerCase();
  const deployBlock = Number(process.env.DONATION_DEPLOY_BLOCK ?? "0");
  const confirmations = Number(process.env.INDEXER_CONFIRMATIONS ?? "3");
  const pollMs = Number(process.env.INDEXER_POLL_MS ?? "2000");
  const maxBlockRange = Number(process.env.INDEXER_MAX_BLOCK_RANGE ?? "10");
  const maxWindowsPerTick = Number(process.env.INDEXER_MAX_WINDOWS_PER_TICK ?? "3");
  const rateLimitBackoffMs = Number(process.env.INDEXER_RATE_LIMIT_BACKOFF_MS ?? "3000");

  return {
    rpcUrl,
    contractAddress,
    deployBlock,
    confirmations,
    pollMs,
    maxBlockRange,
    maxWindowsPerTick,
    rateLimitBackoffMs,
  };
};

const recalcCampaignCurrentAmounts = async (campaignIds: string[]) => {
  if (campaignIds.length === 0) return;

  for (const campaignId of campaignIds) {
    const donations = await Donation.find({ campaignId }).select("amountWei");
    const totalWei = donations.reduce((sum, item) => sum + BigInt(item.amountWei || "0"), 0n);
    const totalEth = Number(ethers.formatEther(totalWei));

    await Campaign.findByIdAndUpdate(campaignId, {
      $set: { currentAmount: totalEth },
    });
  }
};

const tick = async () => {
  if (running) return;
  if (Date.now() < cooldownUntil) return;
  running = true;

  try {
    const {
      rpcUrl,
      contractAddress,
      deployBlock,
      confirmations,
      maxBlockRange,
      maxWindowsPerTick,
      rateLimitBackoffMs,
    } = getConfig();

    if (!rpcUrl || !contractAddress || !deployBlock) {
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const latestBlock = await provider.getBlockNumber();
    const safeBlock = latestBlock - confirmations;

    if (safeBlock <= deployBlock) {
      return;
    }

    let syncState = await SyncState.findOne({ key: SYNC_KEY });
    if (!syncState) {
      syncState = await SyncState.create({
        key: SYNC_KEY,
        lastSyncedBlock: deployBlock - 1,
      });
    }

    const fromBlock = syncState.lastSyncedBlock + 1;
    if (fromBlock > safeBlock) return;

    const eventFragment = donationInterface.getEvent("DonationSent");
    const topic0 = eventFragment.topicHash;

    const touchedCampaignIds = new Set<string>();

    let windowsProcessed = 0;

    for (let start = fromBlock; start <= safeBlock; start += maxBlockRange) {
      if (windowsProcessed >= maxWindowsPerTick) {
        break;
      }

      const end = Math.min(start + maxBlockRange - 1, safeBlock);

      let logs: ethers.Log[] = [];
      try {
        logs = await provider.getLogs({
          address: contractAddress,
          fromBlock: start,
          toBlock: end,
          topics: [topic0],
        });
      } catch (error) {
        const err = error as { error?: { code?: number; message?: string }; shortMessage?: string };
        const isRateLimit = err?.error?.code === 429;

        if (isRateLimit) {
          cooldownUntil = Date.now() + rateLimitBackoffMs;
          console.warn(
            `[donation-indexer] rate limited (429). Cooling down for ${rateLimitBackoffMs}ms`
          );
          return;
        }

        throw error;
      }

      windowsProcessed += 1;

      for (const log of logs) {
        let parsed: ethers.LogDescription;
        try {
          parsed = donationInterface.parseLog(log);
        } catch {
          continue;
        }

        const donor = String(parsed.args[0]).toLowerCase();
        const receiver = String(parsed.args[1]).toLowerCase();
        const campaignIdOnChain = BigInt(parsed.args[2].toString());
        const amountWei = parsed.args[3].toString();
        const mongoCampaignId = toMongoCampaignId(campaignIdOnChain);

        if (!mongoCampaignId) {
          continue;
        }

        const campaign = await Campaign.findById(mongoCampaignId)
          .select("_id receiveWalletAddress")
          .lean();

        if (!campaign) {
          continue;
        }

        if (String(campaign.receiveWalletAddress).toLowerCase() !== receiver) {
          continue;
        }

        const txHash = log.transactionHash.toLowerCase();
        const payload = {
          campaignId: campaign._id,
          campaignIdOnChain: campaignIdOnChain.toString(),
          walletAddress: donor,
          amountWei,
          amountEth: ethers.formatEther(amountWei),
          blockNumber: log.blockNumber,
          txHash,
          logIndex: log.index,
        };

        try {
          await Donation.findOneAndUpdate(
            {
              txHash,
              logIndex: log.index,
            },
            {
              $set: payload,
            },
            {
              upsert: true,
              returnDocument: "after",
              setDefaultsOnInsert: true,
            }
          );
        } catch (error) {
          // Backward-compatible path when old unique index txHash_1 is still present.
          const mongoError = error as { code?: number };
          if (mongoError.code === 11000) {
            await Donation.updateOne(
              { txHash },
              {
                $set: payload,
              },
              { upsert: false }
            );
          } else {
            throw error;
          }
        }

        touchedCampaignIds.add(String(campaign._id));
      }
    }

    if (touchedCampaignIds.size > 0) {
      await recalcCampaignCurrentAmounts(Array.from(touchedCampaignIds));
    }

    const syncedToBlock = Math.min(
      syncState.lastSyncedBlock + windowsProcessed * maxBlockRange,
      safeBlock
    );

    await SyncState.updateOne(
      { key: SYNC_KEY },
      { $set: { lastSyncedBlock: syncedToBlock } },
      { upsert: true }
    );
  } catch (error) {
    console.error("[donation-indexer] tick failed:", error);
  } finally {
    running = false;
  }
};

export const startDonationIndexer = () => {
  const { pollMs } = getConfig();

  void tick();
  setInterval(() => {
    void tick();
  }, pollMs);
};
