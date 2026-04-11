"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { SecondaryButton } from "@/components/Button/SecondaryButton";
import { FundraiserCard } from "@/components/Fundraisers/FundraiserCard";
import {
    Campaign,
    deleteMyCampaign,
    getMyCampaigns,
    MyCampaignFilter,
} from "@/services/campaignService";
import { getDaysLeft } from "@/utils/campaignDate";
import { useRouter } from "next/navigation";

type DisplayStatus = "active" | "expired" | "deleted";

const filters: Array<{ value: MyCampaignFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "deleted", label: "Deleted" },
];

export default function MyCampaingsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<MyCampaignFilter>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadCampaigns = async (nextFilter: MyCampaignFilter) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getMyCampaigns(nextFilter);
            setCampaigns(data);
        } catch {
            setError("Khong the tai danh sach campaign. Vui long thu lai.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCampaigns(filter);
    }, [filter]);

    const getDisplayStatus = (campaign: Campaign): DisplayStatus => {
        if (campaign.deletedAt) {
            return "deleted";
        }

        const endTime = campaign.endDate ? new Date(campaign.endDate).getTime() : Number.POSITIVE_INFINITY;
        if (endTime < Date.now()) {
            return "expired";
        }

        return "active";
    };

    const statusLabel = (status: DisplayStatus): string => {
        if (status === "active") return "Active";
        if (status === "expired") return "Expired";
        return "Deleted";
    };

    const statusClass = (status: DisplayStatus): string => {
        if (status === "active") return "bg-emerald-100 text-emerald-700";
        if (status === "expired") return "bg-amber-100 text-amber-700";
        return "bg-rose-100 text-rose-700";
    };

    const handleDelete = async (campaignId: string) => {
        const accepted = window.confirm("Ban chac chan muon xoa campaign nay?");
        if (!accepted) {
            return;
        }

        setDeletingId(campaignId);
        const deleted = await deleteMyCampaign(campaignId);
        setDeletingId(null);

        if (!deleted) {
            setError("Xoa campaign that bai. Vui long thu lai.");
            return;
        }

        await loadCampaigns(filter);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Campaigns</h1>
                    <p className="mt-1 text-sm text-slate-600">All campaigns you have created.</p>
                </div>

                <PrimaryButton
                    type="button"
                    className="px-5 py-2 text-sm"
                    onClick={() => router.push("/campaigns/create")}
                >
                    Start a Fundraiser
                </PrimaryButton>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((item) =>
                    item.value === filter ? (
                        <PrimaryButton
                            key={item.value}
                            type="button"
                            className="px-4 py-2 text-sm"
                            onClick={() => setFilter(item.value)}
                        >
                            {item.label}
                        </PrimaryButton>
                    ) : (
                        <SecondaryButton
                            key={item.value}
                            type="button"
                            className="px-4 py-2 text-sm"
                            onClick={() => setFilter(item.value)}
                        >
                            {item.label}
                        </SecondaryButton>
                    )
                )}
            </div>

            {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Loading campaigns...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && campaigns.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Khong co campaign nao phu hop voi bo loc nay.
                </div>
            )}

            {!loading && !error && campaigns.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => {
                        const displayStatus = getDisplayStatus(campaign);
                        const isDeleted = displayStatus === "deleted";

                        return (
                            <div key={campaign._id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(displayStatus)}`}>
                                        {statusLabel(displayStatus)}
                                    </span>

                                    {!isDeleted && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(campaign._id)}
                                            disabled={deletingId === campaign._id}
                                            className="rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {deletingId === campaign._id ? "Deleting..." : "Delete"}
                                        </button>
                                    )}
                                </div>

                                <Link href={`/campaigns/${campaign._id}`} className={isDeleted ? "pointer-events-none opacity-70" : "block"}>
                                    <FundraiserCard
                                        title={campaign.title}
                                        description={campaign.description}
                                        image={campaign.image?.[0] ?? "/placeholder.png"}
                                        goalAmount={campaign.goalAmount}
                                        currentAmount={campaign.currentAmount}
                                        time={getDaysLeft(campaign.endDate)}
                                        amountUnit="USD "
                                        variant="small"
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}