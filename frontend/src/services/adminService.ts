export type AdminStats = {
  totalCampaigns: number;
  completedGoalCount: number;
  totalEth: number;
  totalDonations: number;
  avgGoalPercentage: number;
  totalUsers: number;
  statusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    completed: number;
    cancelled: number;
  };
};

export type AdminCampaign = {
  _id: string;
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  image?: string[];
  creator: string;
  receiveWalletAddress: string;
  status: string;
  endDate: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerId: string;
  walletAddress?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  campaignCount: number;
};

export type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CampaignsResponse = {
  campaigns: AdminCampaign[];
  pagination: PaginationData;
};

export type UsersResponse = {
  users: AdminUser[];
  pagination: PaginationData;
};

export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAdminCampaigns(
  status: string = "all",
  page: number = 1,
  limit: number = 10
): Promise<CampaignsResponse | null> {
  try {
    const res = await fetch(
      `/api/admin/campaigns?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateCampaignStatus(
  id: string,
  status: "approved" | "rejected" | "pending"
): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/campaigns/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAdminUsers(
  page: number = 1,
  limit: number = 10
): Promise<UsersResponse | null> {
  try {
    const res = await fetch(
      `/api/admin/users?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
