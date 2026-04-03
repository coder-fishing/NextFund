'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Nav/Navbar';
import HeroSection from '@/components/Hero/HerroSection';
import ETHSection from '@/components/ETH/ETHSection';
import { FundraisersSection } from '@/components/Fundraisers/FundraisersSection';
import StepSection from '@/components/Step/StepSection';
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface MetaMaskError {
  code?: number;
  message?: string;
}

interface CampaignFormData {
  title: string;
  description: string;
  goalAmount: string;
  endDate: string;
  imageUrls: string;
  receiveWalletAddress: string;
}

interface WalletItem {
  _id?: string;
  address: string;
  isPrimary: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [walletChainId, setWalletChainId] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    goalAmount: '',
    endDate: '',
    imageUrls: '',
    receiveWalletAddress: '',
  });

  const loadWallet = async () => {
    if (!session?.user?.email) {
      return;
    }

    setLoadingWallet(true);
    try {
      const response = await fetch(`/api/wallet`);
      const data = (await response.json()) as {
        walletAddress?: string | null;
        wallets?: WalletItem[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể tải thông tin ví đã liên kết');
      }

      const walletList = Array.isArray(data.wallets) ? data.wallets : [];
      const selectedAddress = data.walletAddress ?? '';

      setWallets(walletList);
      setWalletAddress(data.walletAddress ?? null);
      setFormData((prev) => ({
        ...prev,
        receiveWalletAddress: selectedAddress || prev.receiveWalletAddress,
      }));
    } catch (error) {
      console.error('Load wallet error:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    void loadWallet();
  }, [session?.user?.email]);

  const handleSubmitCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!walletAddress) {
      setErrorMessage('Bạn cần kết nối ví và lưu ví trước khi đăng campaign.');
      return;
    }

    if (!formData.receiveWalletAddress) {
      setErrorMessage('Bạn cần chọn ví nhận tiền cho campaign.');
      return;
    }

    setSubmitting(true);
    try {
      const imageArray = formData.imageUrls
        .split(',')
        .map((url) => url.trim())
        .filter((url) => Boolean(url));

      const response = await fetch(`/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          goalAmount: Number(formData.goalAmount),
          endDate: new Date(formData.endDate).toISOString(),
          image: imageArray,
          receiveWalletAddress: formData.receiveWalletAddress,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? 'Đăng campaign thất bại');
      }

      setSuccessMessage('Đăng campaign thành công! Chờ admin duyệt.');
      setFormData({
        title: '',
        description: '',
        goalAmount: '',
        endDate: '',
        imageUrls: '',
        receiveWalletAddress: formData.receiveWalletAddress,
      });
    } catch (error) {
      console.error('Create campaign error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const connectWallet = async () => {
    setWalletError(null);

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

    if (!ethereum) {
      setWalletError('Không tìm thấy MetaMask. Hãy cài extension MetaMask trước.');
      return;
    }

    setConnectingWallet(true);
    try {
      const accountsResult = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainIdResult = await ethereum.request({
        method: 'eth_chainId',
      });

      const accounts = Array.isArray(accountsResult) ? (accountsResult as string[]) : [];

      if (!accounts[0]) {
        setWalletError('Không lấy được địa chỉ ví từ MetaMask.');
        return;
      }

      const response = await fetch(`/api/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: accounts[0] }),
      });

      const data = (await response.json()) as { walletAddress?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể lưu địa chỉ ví lên server');
      }

      setWalletAddress(data.walletAddress ?? accounts[0]);
      setWalletChainId(typeof chainIdResult === 'string' ? chainIdResult : null);
      await loadWallet();
    } catch (error) {
      const mmError = error as MetaMaskError;

      if (mmError?.code === 4001) {
        setWalletError('Bạn đã từ chối yêu cầu kết nối ví trong MetaMask. Bấm lại để thử tiếp.');
      } else if (mmError?.code === -32002) {
        setWalletError('MetaMask đang có yêu cầu chờ xử lý. Hãy mở popup MetaMask để xác nhận.');
      } else {
        console.error('Connect wallet error:', error);
        setWalletError('Kết nối ví thất bại. Vui lòng thử lại.');
      }

      setWalletAddress(null);
      setWalletChainId(null);
    } finally {
      setConnectingWallet(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <HeroSection/>
      <ETHSection />
      <StepSection />
      <FundraisersSection />

    </>
  );
}
