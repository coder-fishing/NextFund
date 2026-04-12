"use client";

import { useEffect, useState } from "react";
import { CommentMessage } from "./CommentMessage";
import { CommentInput } from "./CommentInput";
import { createCampaignComment, getCampaignComments, UiComment } from "@/services/commentService";

type Props = {
  campaignId: string;
};

export const Comment = ({ campaignId }: Props) => {
  const PAGE_SIZE = 5;
  const [comments, setComments] = useState<UiComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCampaignComments(campaignId, 1, PAGE_SIZE);
        if (!cancelled) {
          setComments(result.comments);
          setHasMore(result.hasMore);
          setPage(1);
        }
      } catch {
        if (!cancelled) setError("Khong tai duoc comments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await getCampaignComments(campaignId, nextPage, PAGE_SIZE);

      setComments((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch {
      setError("Khong tai them duoc comments.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateComment = async () => {
    const content = newComment.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createCampaignComment({ campaignId, content });

      if (!created) {
        setError("Gui comment that bai.");
        return;
      }

      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch {
      setError("Gui comment that bai.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-white">
      <div className="comment-input-scrollbar max-h-125 space-y-4 overflow-y-auto p-4">
        {loading && <p className="text-sm text-slate-500">Dang tai comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-slate-500">Chua co comment nao.</p>
        )}
        {comments.map((item) => (
          <CommentMessage
            key={item.id}
            author={item.author}
            avatar={item.avatar}
            content={item.content}
            createdAt={item.createdAt}
          />
        ))}
      </div>

      {!loading && hasMore && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-sm font-medium text-slate-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Dang tai them..." : "Read more"}
          </button>
        </div>
      )}

      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}

      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleCreateComment}
        isSubmitting={submitting}
      />
    </div>
  );
};