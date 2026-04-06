import { useCallback, useEffect, useState } from "react";
import type { WalletItem } from "@/app/campaigns/create/types";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface MetaMaskError {
  code?: number;
}

type Args = {
  userEmail?: string | null;
  onError: (message: string) => void;
  onReceiveWalletPrefill: (walletAddress: string) => void;
};

export function useCreateCampaignWallet({ userEmail, onError, onReceiveWalletPrefill }: Args) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const loadWallet = useCallback(async () => {
    if (!userEmail) return;

    setLoadingWallet(true);
    try {
      const response = await fetch("/api/wallet");
      const data = (await response.json()) as {
        walletAddress?: string | null;
        wallets?: WalletItem[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to load wallet information.");
      }

      const walletList = Array.isArray(data.wallets) ? data.wallets : [];
      const selectedAddress = data.walletAddress ?? "";

      setWallets(walletList);
      setWalletAddress(data.walletAddress ?? null);
      onReceiveWalletPrefill(selectedAddress);
    } catch (error) {
      console.error("Load wallet error:", error);
      onError(error instanceof Error ? error.message : "Unable to load wallet.");
    } finally {
      setLoadingWallet(false);
    }
  }, [onError, onReceiveWalletPrefill, userEmail]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const connectWallet = async () => {
    onError("");

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      onError("MetaMask not found. Please install MetaMask first.");
      return;
    }

    setConnectingWallet(true);
    try {
      const accountsResult = await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = Array.isArray(accountsResult) ? (accountsResult as string[]) : [];

      if (!accounts[0]) {
        throw new Error("Unable to get wallet address from MetaMask.");
      }

      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: accounts[0] }),
      });

      const data = (await response.json()) as { walletAddress?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to save wallet address.");
      }

      setWalletAddress(data.walletAddress ?? accounts[0]);
      await loadWallet();
    } catch (error) {
      const mmError = error as MetaMaskError;
      if (mmError?.code === 4001) {
        onError("You rejected the wallet connection request.");
      } else {
        onError(error instanceof Error ? error.message : "Connect wallet failed.");
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  return {
    walletAddress,
    wallets,
    loadingWallet,
    connectingWallet,
    loadWallet,
    connectWallet,
  };
}
