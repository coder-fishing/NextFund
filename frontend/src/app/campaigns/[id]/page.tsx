"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { ProgressBar } from "@/components/Hero/ProgressBar";
import { Campaign, getCampaignById } from "@/services/campaignService";
import { getDaysLeft } from "@/utils/campaignDate";
import { formatDate, formatVnd } from "@/utils/campaignFormat";

type DetailState = {
  loading: boolean;
  error: string | null;
  campaign: Campaign | null;
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [state, setState] = useState<DetailState>({
    loading: true,
    error: null,
    campaign: null,
  });

  useEffect(() => {
    if (!id) {
      setState({
        loading: false,
        error: "Invalid campaign id.",
        campaign: null,
      });
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setState({ loading: true, error: null, campaign: null });

      try {
        const campaign = await getCampaignById(id);

        if (cancelled) return;

        if (!campaign) {
          setState({
            loading: false,
            error: "Campaign not found.",
            campaign: null,
          });
          return;
        }

        if (campaign.status !== "approved") {
          setState({
            loading: false,
            error: "This campaign is not publicly available.",
            campaign: null,
          });
          return;
        }

        setState({ loading: false, error: null, campaign });
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            error: "Unable to load campaign details. Please try again later.",
            campaign: null,
          });
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const progress = useMemo(() => {
    if (!state.campaign || state.campaign.goalAmount <= 0) return 0;
    return Math.min(
      100,
      Math.max(0, (state.campaign.currentAmount / state.campaign.goalAmount) * 100)
    );
  }, [state.campaign]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/campaigns" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to campaigns
        </Link>
      </div>

      {state.loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading campaign details...
        </div>
      )}

      {!state.loading && state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && state.campaign && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={state.campaign.image?.[0] ?? "/placeholder.png"}
                alt={state.campaign.title}
                className="h-80 w-full object-cover"
              />
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Approved
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {getDaysLeft(state.campaign.endDate)}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-slate-900">{state.campaign.title}</h1>
                <p className="whitespace-pre-line text-slate-700">{state.campaign.description}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-sm text-slate-500">Raised</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatVnd(state.campaign.currentAmount)} VND
                </p>
                <p className="text-sm text-slate-600">Goal {formatVnd(state.campaign.goalAmount)} VND</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">{progress.toFixed(0)}% funded</p>
                <ProgressBar value={progress} />
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  End date: <span className="font-medium text-slate-900">{formatDate(state.campaign.endDate)}</span>
                </p>
                <p>
                  Organizer: <span className="font-medium text-slate-900">{state.campaign.creator ?? "Unknown"}</span>
                </p>
              </div>

              <PrimaryButton type="button" className="w-full px-5 py-3 text-sm">
                Donate now (next step)
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
