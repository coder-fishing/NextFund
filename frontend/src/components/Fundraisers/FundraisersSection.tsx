'use client';

import { useEffect, useState } from "react";
import { FundraiserCard } from "./FundraiserCard";
import { getLatestCampaigns } from "@/services/campaignService";
import type { Campaign } from "@/services/campaignService";
import { SecondaryButton } from "../Button/SecondaryButton";
import Link from "next/dist/client/link";

const formatDaysAgo = (createdAt?: string) => {
    if (!createdAt) return undefined;
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return undefined;

    const diffMs = Date.now() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    return `${diffDays} d ago`;
};

export const FundraisersSection = () => {
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        getLatestCampaigns(5).then((data) => {
            if (!cancelled) {
                setCampaigns(data);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!campaigns) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Outstanding fundraising campaigns
                    </h2>
                    <p className="text-center text-gray-500">Loading campaigns...</p>
                </div>
            </section>
        );
    }

    if (campaigns.length === 0) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Outstanding fundraising campaigns
                    </h2>
                    <p className="text-center text-gray-500">
                        There are no campaigns currently underway.
                    </p>
                </div>
            </section>
        );
    }

    const [first, ...rest] = campaigns;

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Outstanding fundraising campaigns
                    </h2>
                    {/* <button className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        Just launched
                        <span className="ml-1 text-gray-400">▼</span>
                    </button> */}
                    <SecondaryButton  className="text-sm">
                        <Link href="/campaigns">
                            View all campaigns
                        </Link>
                    </SecondaryButton>
                </div>

                {/* Container chính: 1 card lớn (cao bằng 2 card nhỏ) + 4 card nhỏ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:grid-rows-2">

                    {/* Card lớn bên trái: span 2 cột và 2 hàng trên màn hình lớn */}
                    <div className="lg:col-span-2 lg:row-span-2">
                        <FundraiserCard
                            key={first._id}
                            title={first.title}
                            image={first.image?.[0] ?? "/placeholder.png"}
                            goalAmount={first.goalAmount}
                            currentAmount={first.currentAmount}
                            time={formatDaysAgo(first.createdAt)}
                            variant="large"
                        />
                    </div>

                    {/* 4 card nhỏ bên phải lấp đầy 4 ô còn lại (2x2) */}
                    {rest.slice(0, 4).map((campaign) => (
                        <div key={campaign._id}>
                            <FundraiserCard
                                title={campaign.title}
                                image={campaign.image?.[0] ?? "/placeholder.png"}
                                goalAmount={campaign.goalAmount}
                                currentAmount={campaign.currentAmount}
                                time={formatDaysAgo(campaign.createdAt)}
                                variant="small"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
