import { SecondaryButton } from "@/components/Button/SecondaryButton";

type SearchCampaignsProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function SearchCampaigns({ search, onSearchChange }: SearchCampaignsProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="campaign-search" className="mb-2 block text-sm font-medium text-slate-700">
          Search campaigns
        </label>
        <input
          id="campaign-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by campaign name or details"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />
      </div>

      <div className="sm:pt-7">
        <SecondaryButton
          type="button"
          onClick={() => onSearchChange("")}
          className="w-full px-4 py-3 text-sm sm:w-auto"
        >
          Clear search
        </SecondaryButton>
      </div>
    </div>
  );
}
