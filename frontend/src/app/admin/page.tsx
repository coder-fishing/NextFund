'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getAdminStats,
  getAdminCampaigns,
  getAdminUsers,
  updateCampaignStatus as apiUpdateStatus,
  getSystemSetting,
  updateSystemSetting,
  bulkModerateCampaigns,
  type AdminStats,
  type AdminCampaign,
  type AdminUser,
  type PaginationData,
} from '@/services/adminService';

// Components
import { StatCard } from '@/components/Admin/StatCard';
import { CampaignsTable } from '@/components/Admin/CampaignsTable';
import { UsersTable } from '@/components/Admin/UsersTable';
import { Pagination } from '@/components/Admin/Pagination';
import { AdminCharts } from '@/components/Admin/AdminCharts';

type Tab = 'campaigns' | 'users';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'manual';

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();

  // Derived state
  const isAdmin = useMemo(
    () => session?.user?.role === 'admin',
    [session?.user?.role]
  );

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('campaigns');

  // Stats State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [campaignStatus, setCampaignStatus] =
    useState<StatusFilter>('all');

  const [campaignPagination, setCampaignPagination] =
    useState<PaginationData | null>(null);

  const [campaignPage, setCampaignPage] = useState(1);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPagination, setUserPagination] =
    useState<PaginationData | null>(null);

  const [userPage, setUserPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Settings State
  const [isAiEnabled, setIsAiEnabled] = useState<boolean | null>(null);
  const [togglingAi, setTogglingAi] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      redirect('/login');
    }
  }, [authStatus]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);

      const data = await getAdminStats();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Fetch stats failed:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Campaigns
  const fetchCampaigns = useCallback(
    async (status: string, page: number) => {
      try {
        setLoadingCampaigns(true);

        const res = await getAdminCampaigns(status, page, 10);

        if (res) {
          setCampaigns(res.campaigns);
          setCampaignPagination(res.pagination);
        }
      } catch (error) {
        console.error('Fetch campaigns failed:', error);
      } finally {
        setLoadingCampaigns(false);
      }
    },
    []
  );

  // Fetch Users
  const fetchUsers = useCallback(async (page: number) => {
    try {
      setLoadingUsers(true);

      const res = await getAdminUsers(page, 10);

      if (res) {
        setUsers(res.users);
        setUserPagination(res.pagination);
      }
    } catch (error) {
      console.error('Fetch users failed:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch Stats
  // Only when authenticated admin
  useEffect(() => {
    if (isAdmin) {
      fetchStats();

      // Fetch AI setting
      getSystemSetting('ai_moderation_enabled').then((val) => {
        setIsAiEnabled(val !== false); // Default to true if null
      });
    }
  }, [isAdmin, fetchStats]);

  // Fetch Campaigns
  useEffect(() => {
    if (isAdmin && activeTab === 'campaigns') {
      fetchCampaigns(campaignStatus, campaignPage);
    }
  }, [
    isAdmin,
    activeTab,
    campaignStatus,
    campaignPage,
    fetchCampaigns,
  ]);

  // Fetch Users
  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchUsers(userPage);
    }
  }, [
    isAdmin,
    activeTab,
    userPage,
    fetchUsers,
  ]);

  // Handle approve/reject
  const handleStatusUpdate = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    const confirmed = confirm(
      `Bạn có chắc chắn muốn ${status === 'approved'
        ? 'DUYỆT'
        : 'TỪ CHỐI'
      } chiến dịch này?`
    );

    if (!confirmed) return;

    try {
      const success = await apiUpdateStatus(id, status);

      if (!success) {
        alert('Cập nhật trạng thái thất bại.');
        return;
      }

      // Refresh stats
      fetchStats();

      // Refresh current campaigns page
      fetchCampaigns(campaignStatus, campaignPage);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    }
  };

  const handleToggleAi = async () => {
    if (isAiEnabled === null || togglingAi) return;

    setTogglingAi(true);
    const newValue = !isAiEnabled;
    const success = await updateSystemSetting('ai_moderation_enabled', newValue);

    if (success) {
      setIsAiEnabled(newValue);
    } else {
      alert('Không thể cập nhật cấu hình AI.');
    }
    setTogglingAi(false);
  };

  const handleBulkModerate = async () => {
    if (isBulkProcessing) return;

    const confirmed = confirm('Bạn có muốn cho AI duyệt hàng loạt tất cả các bài đang chờ (Pending) không?');
    if (!confirmed) return;

    try {
      setIsBulkProcessing(true);
      const res = await bulkModerateCampaigns();

      if (res) {
        alert(`Đã xử lý xong: ${res.processed} bài. Trong đó có ${res.approved} bài được duyệt tự động.`);
        fetchStats();
        fetchCampaigns(campaignStatus, campaignPage);
      } else {
        alert('Duyệt hàng loạt thất bại.');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra trong quá trình duyệt hàng loạt.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Guards
  if (authStatus === 'loading') {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-6 mb-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Admin{' '}
                <span className="text-emerald-600">
                  Dashboard
                </span>
              </h1>

              <p className="text-gray-500 mt-1 font-medium">
                Quản lý hệ thống, phê duyệt chiến dịch và
                người dùng.
              </p>
            </div>

            {/* AI Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBulkModerate}
                disabled={isBulkProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-bold ${isBulkProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isBulkProcessing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Duyệt AI hàng loạt
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">Tự động duyệt AI</span>
                  <span className="text-[10px] text-gray-400">Sử dụng AI để duyệt bài mới</span>
                </div>
                <button
                  onClick={handleToggleAi}
                  disabled={isAiEnabled === null || togglingAi}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAiEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    } ${togglingAi ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Tổng Campaign"
            value={
              loadingStats && !stats
                ? '...'
                : stats?.totalCampaigns ?? 0
            }
          />

          <StatCard
            label="Hoàn thành 100%"
            value={
              loadingStats && !stats
                ? '...'
                : stats?.completedGoalCount ?? 0
            }
          />

          <StatCard
            label="Tổng ETH đạt được"
            value={
              loadingStats && !stats
                ? '...'
                : `${stats?.totalEth ?? 0} ETH`
            }
          />

          <StatCard
            label="% Đạt được TB"
            value={
              loadingStats && !stats
                ? '...'
                : `${stats?.avgGoalPercentage ?? 0}%`
            }
          />
        </div>

        {/* Charts Section */}
        <AdminCharts stats={stats} />

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 py-5 text-sm font-bold transition-all ${activeTab === 'campaigns'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              Quản lý Chiến dịch
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-5 text-sm font-bold transition-all ${activeTab === 'users'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              Danh sách Người dùng
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'campaigns' ? (
              <>
                {/* Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(
                    [
                      'all',
                      'pending',
                      'approved',
                      'rejected',
                      'manual',
                    ] as StatusFilter[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setCampaignStatus(status);
                        setCampaignPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${campaignStatus === status
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-500 border-gray-200'
                        }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>

                <CampaignsTable
                  campaigns={campaigns}
                  onStatusUpdate={handleStatusUpdate}
                  isLoading={loadingCampaigns}
                />

                <Pagination
                  currentPage={campaignPage}
                  totalPages={
                    campaignPagination?.totalPages ?? 1
                  }
                  onPageChange={setCampaignPage}
                />
              </>
            ) : (
              <>
                <UsersTable
                  users={users}
                  isLoading={loadingUsers}
                />

                <Pagination
                  currentPage={userPage}
                  totalPages={
                    userPagination?.totalPages ?? 1
                  }
                  onPageChange={setUserPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}