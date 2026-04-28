"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { SecondaryButton } from "@/components/Button/SecondaryButton";
import { FundraiserCard } from "@/components/Fundraisers/FundraiserCard";
import { Campaign, getApprovedCampaigns } from "@/services/campaignService";
import { SearchCampaigns } from "@/components/SearchCampaigns/SearchCampaigns";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { categoryOptions, CategoryFilter, heroCopyByCategory } from "@/const/campaigns";
import { getDaysLeft } from "@/utils/campaignDate";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    let cancelled = false;

    const loadCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getApprovedCampaigns(category, debouncedSearch);
        if (!cancelled) {
          setCampaigns(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load campaigns. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCampaigns();

    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch]);

  const heroCopy = heroCopyByCategory[category];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-14 grid grid-cols-1 items-center gap-8 rounded-3xl bg-slate-50 p-6 sm:p-8 lg:grid-cols-2 lg:p-12">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            {heroCopy.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">{heroCopy.subtitle}</p>

          <div className="mt-6">
            <PrimaryButton
              type="button"
              className="px-6 py-3 text-sm"
              onClick={() => router.push("/campaigns/create")}
            >
              Start a Fundraiser
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1000&q=80"
            alt="People supporting each other"
            className="h-full min-h-65 w-full object-cover"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Browse fundraisers</h2>
        <p className="text-slate-600">Filter by category or search by title and description.</p>
      </div>

      <SearchCampaigns search={search} onSearchChange={setSearch} />

      <div className="mb-4 flex flex-wrap gap-2">
        {categoryOptions.map((item) =>
          category === item.value ? (
            <PrimaryButton
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className="px-4 py-2 text-sm"
            >
              {item.label}
            </PrimaryButton>
          ) : (
            <SecondaryButton
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className="px-4 py-2 text-sm"
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
          No approved campaigns match your current filters.
        </div>
      )}

      {!loading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign._id} href={`/campaigns/${campaign._id}`} className="block">
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
          ))}
        </div>
      )}
    </div>
  );
}
