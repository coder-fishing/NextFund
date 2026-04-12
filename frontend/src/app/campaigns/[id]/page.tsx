"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { ProgressBar } from "@/components/Hero/ProgressBar";
import { Campaign, getCampaignById } from "@/services/campaignService";
import { getDaysLeft } from "@/utils/campaignDate";
import { formatDate } from "@/utils/campaignFormat";
import { ethers } from "ethers";
import { DONATION_CONTRACT_ADDRESS, DONATION_CONTRACT_ABI } from "@/const/donationContract";
import {Comment} from "@/components/Comment/Comment";

type DetailState = {
  loading: boolean;
  error: string | null;
  campaign: Campaign | null;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const toEthAmount = (amountWei?: string, fallback = 0): number => {
  if (amountWei && /^\d+$/.test(amountWei)) {
    return Number(ethers.formatEther(amountWei));
  }

  return fallback;
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [state, setState] = useState<DetailState>({
    loading: true,
    error: null,
    campaign: null,
  });
  const [donateEth, setDonateEth] = useState("0.001");
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);
  const [donateSuccess, setDonateSuccess] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalanceEth, setWalletBalanceEth] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setState({
        loading: false,
        error: "Invalid campaign id.",
        campaign: null,
      });
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setState({ loading: true, error: null, campaign: null });

      try {
        const campaign = await getCampaignById(id);

        if (cancelled) return;

        if (!campaign) {
          setState({
            loading: false,
            error: "Campaign not found.",
            campaign: null,
          });
          return;
        }

        if (campaign.status !== "approved") {
          setState({
            loading: false,
            error: "This campaign is not publicly available.",
            campaign: null,
          });
          return;
        }

        setState({ loading: false, error: null, campaign });
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            error: "Unable to load campaign details. Please try again later.",
            campaign: null,
          });
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goalEth = useMemo(() => {
    if (!state.campaign) return 0;
    return toEthAmount(state.campaign.goalAmountWei, state.campaign.goalAmount);
  }, [state.campaign]);

  const raisedEth = useMemo(() => {
    if (!state.campaign) return 0;
    return toEthAmount(state.campaign.currentAmountWei, state.campaign.currentAmount);
  }, [state.campaign]);

  const progress = useMemo(() => {
    if (goalEth <= 0) return 0;
    return Math.min(100, Math.max(0, (raisedEth / goalEth) * 100));
  }, [goalEth, raisedEth]);

  const fetchWalletBalance = async (
    provider: ethers.BrowserProvider,
    address: string
  ): Promise<void> => {
    const balance = await provider.getBalance(address);
    setWalletBalanceEth(Number(ethers.formatEther(balance)).toFixed(6));
  };

  const handleCheckBalance = async () => {
    setDonateError(null);

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      setDonateError("MetaMask not found.");
      return;
    }

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(
        ethereum as unknown as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      await fetchWalletBalance(provider, address);
    } catch (error) {
      setDonateError(error instanceof Error ? error.message : "Unable to fetch wallet balance.");
    }
  };

  const toOnChainCampaignId = (campaignId: string): bigint => {
    if (!/^[a-fA-F0-9]{24}$/.test(campaignId)) {
      throw new Error("Invalid campaign id format.");
    }

    return BigInt(`0x${campaignId}`);
  };

  const handleDonate = async () => {
    setDonateError(null);
    setDonateSuccess(null);

    if (!state.campaign) {
      setDonateError("Campaign is not loaded.");
      return;
    }

    if (!state.campaign.receiveWalletAddress) {
      setDonateError("Campaign receiver wallet is missing.");
      return;
    }

    if (!DONATION_CONTRACT_ADDRESS) {
      setDonateError("Missing NEXT_PUBLIC_DONATION_CONTRACT in frontend env.");
      return;
    }

    if (!donateEth || Number(donateEth) <= 0) {
      setDonateError("Please enter a valid ETH amount.");
      return;
    }

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

    if (!ethereum) {
      setDonateError("MetaMask not found.");
      return;
    }

    setDonating(true);

    try {
      await ethereum.request({ method: "eth_requestAccounts" });

      const chainIdHex = (await ethereum.request({ method: "eth_chainId" })) as string;
      const sepoliaChainId = "0xaa36a7";

      if (chainIdHex !== sepoliaChainId) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }],
        });
      }

      const provider = new ethers.BrowserProvider(
        ethereum as unknown as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const donorAddress = await signer.getAddress();
      setWalletAddress(donorAddress);
      await fetchWalletBalance(provider, donorAddress);

      const contract = new ethers.Contract(
        DONATION_CONTRACT_ADDRESS,
        DONATION_CONTRACT_ABI,
        signer
      );

      const campaignIdOnChain = toOnChainCampaignId(state.campaign._id);

      const tx = await contract.donate(
        state.campaign.receiveWalletAddress,
        campaignIdOnChain,
        {
          value: ethers.parseEther(donateEth),
        }
      );

      const receipt = await tx.wait();
      const txHash = receipt?.hash ?? tx.hash;

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: state.campaign._id,
          txHash,
          walletAddress: donorAddress,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Saved on-chain, but failed to save donation in DB.");
      }

      setDonateSuccess(`Donate success. Tx hash: ${txHash}`);
      await fetchWalletBalance(provider, donorAddress);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Donate failed.";

      if (message.toLowerCase().includes("insufficient funds")) {
        setDonateError("Insufficient Sepolia ETH for amount + gas fee. Please lower amount or top up test ETH.");
      } else {
        setDonateError(message);
      }
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/campaigns" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to campaigns
        </Link>
      </div>

      {state.loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading campaign details...
        </div>
      )}

      {!state.loading && state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && state.campaign && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={state.campaign.image?.[0] ?? "/placeholder.png"}
                alt={state.campaign.title}
                className="h-80 w-full object-cover"
              />
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Approved
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {getDaysLeft(state.campaign.endDate)}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-slate-900">{state.campaign.title}</h1>
                <p className="whitespace-pre-line text-slate-700">{state.campaign.description}</p>
              </div>
            </div>       
              <Comment campaignId={state.campaign._id} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-sm text-slate-500">Raised</p>
                <p className="text-2xl font-bold text-slate-900">
                  {raisedEth.toFixed(4)} ETH
                </p>
                <p className="text-sm text-slate-600">Goal {goalEth.toFixed(4)} ETH</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">{progress.toFixed(0)}% funded</p>
                <ProgressBar value={progress} />
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  End date: <span className="font-medium text-slate-900">{formatDate(state.campaign.endDate)}</span>
                </p>
                <p>
                  Organizer: <span className="font-medium text-slate-900">{state.campaign.creator ?? "Unknown"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="donate-eth" className="block text-sm font-medium text-slate-700">
                  Amount (ETH)
                </label>
                <input
                  id="donate-eth"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={donateEth}
                  onChange={(event) => setDonateEth(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="0.001"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {walletAddress
                      ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : "Wallet: not connected"}
                  </p>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-700 underline underline-offset-2"
                    onClick={handleCheckBalance}
                  >
                    Check balance
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Balance: {walletBalanceEth ? `${walletBalanceEth} ETH` : "--"}
                </p>
              </div>

              {donateError && <p className="text-sm text-red-600">{donateError}</p>}
              {donateSuccess && <p className="break-all text-sm text-emerald-700">{donateSuccess}</p>}

              <PrimaryButton
                type="button"
                className="w-full px-5 py-3 text-sm"
                onClick={handleDonate}
                disabled={donating}
              >
                {donating ? "Processing..." : "Donate now"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
