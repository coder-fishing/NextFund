export type CampaignCategory =
  | "medical"
  | "education"
  | "emergency"
  | "animals"
  | "community"
  | "general";

export type Campaign = {
  _id: string;
  title: string;
  description: string;
  category?: CampaignCategory;
  goalAmount: number;
  currentAmount: number;
  goalAmountWei?: string;
  currentAmountWei?: string;
  image?: string[];
  status?: "active" | "completed" | "cancelled" | "approved" | "rejected" | "pending";
  creator?: string;
  receiveWalletAddress?: string;
  createdAt?: string;
  endDate?: string;
  deletedAt?: string | null;
};

export type MyCampaignFilter = "all" | "active" | "expired" | "deleted";

// URL backend chuyên cho campaign; KHÔNG dùng NEXT_PUBLIC_API_URL để tránh trỏ nhầm sang frontend
const backendApiUrl =
  process.env.BACKEND_API_URL ?? "http://localhost:5000/api";

// Cache đơn giản phía client: lưu dữ liệu trong module tối đa 5 phút
let cachedCampaigns: Campaign[] | null = null;
let cachedAt: number | null = null;

export async function getLatestCampaigns(limit = 5): Promise<Campaign[]> {
  try {
    const now = Date.now();

    // Nếu đã có cache và còn hạn 5 phút thì dùng lại, tránh gọi API liên tục
    if (cachedCampaigns && cachedAt && now - cachedAt < 5 * 60 * 1000) {
      return cachedCampaigns.slice(0, limit);
    }

    const res = await fetch(`${backendApiUrl}/campaigns`);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data?.campaigns)) {
      return [];
    }

    const campaigns: Campaign[] = data.campaigns
      .slice()
      .sort((a: Campaign, b: Campaign) => {
        const dateA = new Date(a.createdAt ?? a.endDate ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? b.endDate ?? 0).getTime();
        return dateB - dateA;
      });

    cachedCampaigns = campaigns;
    cachedAt = now;

    return campaigns.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getApprovedCampaigns(category?: CampaignCategory | "all"): Promise<Campaign[]> {
  try {
    const categoryQuery = category && category !== "all" ? `?category=${category}` : "";
    const res = await fetch(`${backendApiUrl}/campaigns/approved${categoryQuery}`);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data?.campaigns)) {
      return [];
    }

    return data.campaigns
      .slice()
      .sort((a: Campaign, b: Campaign) => {
        const dateA = new Date(a.createdAt ?? a.endDate ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? b.endDate ?? 0).getTime();
        return dateB - dateA;
      });
  } catch {
    return [];
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const res = await fetch(`${backendApiUrl}/campaigns/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (!data?.campaign || typeof data.campaign !== "object") {
      return null;
    }

    return data.campaign as Campaign;
  } catch {
    return null;
  }
}

export async function getMyCampaigns(filter: MyCampaignFilter = "all"): Promise<Campaign[]> {
  try {
    const res = await fetch(`/api/campaigns/my?filter=${encodeURIComponent(filter)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data?.campaigns)) {
      return [];
    }

    return data.campaigns;
  } catch {
    return [];
  }
}

export async function deleteMyCampaign(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function exportCampaignStatementCsv(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}/statement?format=csv`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Khong the xuat sao ke CSV");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] ?? `campaign-${id}-statement.csv`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
