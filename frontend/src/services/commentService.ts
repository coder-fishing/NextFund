export type UiComment = {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
};

export type CommentPage = {
  comments: UiComment[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
};

type ApiComment = {
  _id: string;
  content: string;
  createdAt: string;
  userId?: {
    name?: string;
    avatar?: string;
  } | string;
};

const toUiComment = (item: ApiComment): UiComment => {
  const user = typeof item.userId === "object" && item.userId ? item.userId : undefined;

  return {
    id: item._id,
    author: user?.name || "Unknown user",
    avatar: user?.avatar,
    content: item.content,
    createdAt: new Date(item.createdAt).toLocaleString("vi-VN"),
  };
};

export async function getCampaignComments(
  campaignId: string,
  page = 1,
  limit = 5
): Promise<CommentPage> {
  const res = await fetch(`/api/comments/${campaignId}?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      comments: [],
      hasMore: false,
      total: 0,
      page,
      limit,
    };
  }

  const data = (await res.json()) as {
    comments?: ApiComment[];
    hasMore?: boolean;
    total?: number;
    page?: number;
    limit?: number;
  };

  const comments = Array.isArray(data.comments) ? data.comments.map(toUiComment) : [];

  return {
    comments,
    hasMore: Boolean(data.hasMore),
    total: Number(data.total) || comments.length,
    page: Number(data.page) || page,
    limit: Number(data.limit) || limit,
  };
}

export async function createCampaignComment(payload: {
  campaignId: string;
  content: string;
}): Promise<UiComment | null> {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { comment?: ApiComment };
  if (!data.comment) return null;

  return toUiComment(data.comment);
}