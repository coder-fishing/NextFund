"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";

type DonateQrCardProps = {
  campaignId?: string;
  receiverWalletAddress?: string;
  donateEth: string;
  donationContractAddress: string;
  chainIdDec: number;
  onError?: (message: string) => void;
};

const toOnChainCampaignId = (campaignId: string): bigint => {
  if (!/^[a-fA-F0-9]{24}$/.test(campaignId)) {
    throw new Error("Invalid campaign id format.");
  }

  return BigInt(`0x${campaignId}`);
};

export function DonateQrCard({
  campaignId,
  receiverWalletAddress,
  donateEth,
  donationContractAddress,
  chainIdDec,
  onError,
}: DonateQrCardProps) {
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);

  // Dùng useMemo để tránh tính toán lại donateDeepLink và donateQrUrl nếu các dependencies không thay đổi
  const donateDeepLink = useMemo(() => {
    try {
      if (!campaignId || !receiverWalletAddress) return null;
      if (!donationContractAddress) return null;
      if (!donateEth || Number(donateEth) <= 0) return null;

      const campaignIdOnChain = toOnChainCampaignId(campaignId).toString();
      const donateWei = ethers.parseEther(donateEth).toString();

      return (
        `ethereum:${donationContractAddress}@${chainIdDec}/donate` +
        `?address=${encodeURIComponent(receiverWalletAddress)}` +
        `&uint256=${encodeURIComponent(campaignIdOnChain)}` +
        `&value=${encodeURIComponent(donateWei)}`
      );
    } catch {
      return null;
    }
  }, [campaignId, receiverWalletAddress, donateEth, donationContractAddress, chainIdDec]);

  const donateQrUrl = useMemo(() => {
    if (!donateDeepLink) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(donateDeepLink)}`;
  }, [donateDeepLink]);

  const handleCopyDeepLink = async () => {
    if (!donateDeepLink) return;

    try {
      await navigator.clipboard.writeText(donateDeepLink);
      setCopiedDeepLink(true);
      window.setTimeout(() => setCopiedDeepLink(false), 1500);
    } catch {
      onError?.("Cannot copy donate link. Please copy manually.");
    }
  };

  if (!donateDeepLink) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-700">Donate by QR (mobile wallet)</p>
      <p className="mt-1 text-xs text-slate-500">Scan QR or open link in your wallet app.</p>

      {donateQrUrl && (
        <div className="mt-3 flex justify-center">
          <img
            src={donateQrUrl}
            alt="Donate QR"
            className="h-44 w-44 rounded-lg border border-slate-200 bg-white p-1"
          />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={donateDeepLink}
          className="rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white"
        >
          Open wallet app
        </a>
        <button
          type="button"
          onClick={handleCopyDeepLink}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
        >
          {copiedDeepLink ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
