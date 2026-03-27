'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Chào mừng, {session.user?.name}! 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Thông Tin Tài Khoản
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Tên:</p>
                <p className="text-gray-800 font-medium">{session.user?.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email:</p>
                <p className="text-gray-800 font-medium">{session.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">ID:</p>
                <p className="text-gray-800 font-medium break-all">{session.user?.id}</p>
              </div>
            </div>
          </div>

          {/* Avatar Card */}
          {session.user?.image && (
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Avatar
              </h2>
              <img
                src={session.user.image}
                alt="User Avatar"
                className="w-32 h-32 rounded-full shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Test Đăng Nhập Ví (MetaMask)</h2>

          <p className="text-gray-600 mb-4">
            Dùng phần này để test kết nối ví và lấy địa chỉ ví trước khi nối bước lưu xuống server.
          </p>

          {walletError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {walletError}
            </div>
          )}

          {walletAddress && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
              <p><strong>Trạng thái:</strong> Đã liên kết ví thành công</p>
              <p><strong>Wallet mặc định:</strong> {walletAddress}</p>
              <p><strong>Chain ID:</strong> {walletChainId ?? 'Không xác định'}</p>
            </div>
          )}

          {loadingWallet && (
            <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
              Đang tải trạng thái ví đã liên kết...
            </div>
          )}

          {!walletAddress && !loadingWallet && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              Bạn chưa liên kết ví. Cần liên kết ví trước khi đăng campaign.
            </div>
          )}

          <button
            type="button"
            onClick={connectWallet}
            disabled={connectingWallet}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectingWallet ? 'Đang kết nối ví...' : 'Kết nối MetaMask'}
          </button>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Đăng Campaign</h2>
          <p className="text-gray-600 mb-6">
            Chỉ tài khoản đã đăng nhập mới có thể đăng campaign. Bài đăng mới sẽ ở trạng thái chờ duyệt.
          </p>

          {errorMessage && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmitCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ví dụ: Gây quỹ phẫu thuật cho bé A"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-28"
                placeholder="Mô tả hoàn cảnh và mục tiêu gây quỹ"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (VND)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goalAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="10000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ví nhận tiền</label>
              <select
                value={formData.receiveWalletAddress}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, receiveWalletAddress: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                disabled={wallets.length === 0}
              >
                <option value="">Chọn ví nhận tiền</option>
                {wallets.map((wallet) => (
                  <option key={wallet._id ?? wallet.address} value={wallet.address}>
                    {wallet.address} {wallet.isPrimary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh (URL, phân tách dấu phẩy)</label>
              <input
                type="text"
                value={formData.imageUrls}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrls: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://..., https://..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !walletAddress}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang đăng campaign...' : 'Đăng campaign'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
