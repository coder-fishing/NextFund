import { useState, useCallback, useEffect } from 'react';
import {
  getAdminStats,
  getAdminCampaigns,
  getAdminUsers,
  getSystemSetting,
  updateSystemSetting,
  AdminStats,
  AdminCampaign,
  AdminUser,
  PaginationData,
} from '@/services/adminService';

export function useAdminStats(isAdmin: boolean) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const data = await getAdminStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Fetch stats failed:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useAdminCampaigns(isAdmin: boolean, initialStatus: string = 'all') {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [status, setStatus] = useState<string>(initialStatus);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const res = await getAdminCampaigns(status, page, 10);
      if (res) {
        setCampaigns(res.campaigns);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error('Fetch campaigns failed:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, status, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    status,
    setStatus,
    page,
    setPage,
    pagination,
    loading,
    refetch: fetchCampaigns,
  };
}

export function useAdminUsers(isAdmin: boolean) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const res = await getAdminUsers(page, 10);
      if (res) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error('Fetch users failed:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    page,
    setPage,
    pagination,
    loading,
    refetch: fetchUsers,
  };
}

export function useSystemSettings(isAdmin: boolean) {
  const [isAiEnabled, setIsAiEnabled] = useState<boolean | null>(null);
  const [togglingAi, setTogglingAi] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      getSystemSetting('ai_moderation_enabled').then((val) => {
        setIsAiEnabled(val !== false); // Default to true if null
      });
    }
  }, [isAdmin]);

  const toggleAiSetting = async () => {
    if (isAiEnabled === null || togglingAi) return false;

    setTogglingAi(true);
    const newValue = !isAiEnabled;
    const success = await updateSystemSetting('ai_moderation_enabled', newValue);

    if (success) {
      setIsAiEnabled(newValue);
    }
    setTogglingAi(false);
    return success;
  };

  return { isAiEnabled, togglingAi, toggleAiSetting };
}
