import Image from "next/image";
import { SecondaryButton } from "@/components/Button/SecondaryButton";
import type { BeneficiaryType, CreateCampaignFormData, WalletItem } from "@/app/campaigns/create/types";

type CategoryOption = {
  value: string;
  label: string;
};

type Props = {
  currentStep: number;
  beneficiary: BeneficiaryType;
  setBeneficiary: (value: BeneficiaryType) => void;
  country: string;
  setCountry: (value: string) => void;
  postcode: string;
  setPostcode: (value: string) => void;
  formData: CreateCampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateCampaignFormData>>;
  nonAllCategories: CategoryOption[];
  selectedImagePreviews: string[];
  handleFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  todayYyyyMmDd: string;
  minEndDate: string;
  loadingWallet: boolean;
  wallets: WalletItem[];
  connectWallet: () => void;
  connectingWallet: boolean;
  categoryLabelMap: Record<string, string>;
  formatCurrency: (amount: string) => string;
};

export function CreateCampaignStepContent({
  currentStep,
  beneficiary,
  setBeneficiary,
  country,
  setCountry,
  postcode,
  setPostcode,
  formData,
  setFormData,
  nonAllCategories,
  selectedImagePreviews,
  handleFilesChange,
  todayYyyyMmDd,
  minEndDate,
  loadingWallet,
  wallets,
  connectWallet,
  connectingWallet,
  categoryLabelMap,
  formatCurrency,
}: Props) {
  if (currentStep === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Who are you fundraising for?</h2>

        <button
          type="button"
          onClick={() => setBeneficiary("yourself")}
          className={`w-full rounded-2xl border px-5 py-5 text-left transition ${
            beneficiary === "yourself"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <p className="text-lg font-semibold text-slate-900">Yourself</p>
          <p className="mt-1 text-sm text-slate-600">Funds are delivered to your own receiving wallet.</p>
        </button>

        <button
          type="button"
          onClick={() => setBeneficiary("someoneElse")}
          className={`w-full rounded-2xl border px-5 py-5 text-left transition ${
            beneficiary === "someoneElse"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <p className="text-lg font-semibold text-slate-900">Someone else</p>
          <p className="mt-1 text-sm text-slate-600">You are raising for another person or community.</p>
        </button>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="Vietnam">Vietnam</option>
            <option value="Germany">Germany</option>
            <option value="Singapore">Singapore</option>
            <option value="United States">United States</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Postcode</label>
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. 700000"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Goal amount (VND)</label>
          <input
            required
            type="number"
            min={1}
            value={formData.goalAmount}
            onChange={(e) => setFormData((prev) => ({ ...prev, goalAmount: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <div className="flex flex-wrap gap-2">
            {nonAllCategories.map((item) => {
              const selected = formData.category === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, category: item.value }))}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Add a cover photo</h2>
          <p className="text-sm text-slate-600">Upload cover images. The first image is used as cover.</p>
        </div>

        <input
          required
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={handleFilesChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />

        {selectedImagePreviews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedImagePreviews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <Image
                  src={preview}
                  alt={`Selected file ${index + 1}`}
                  width={400}
                  height={240}
                  className="h-40 w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Give your fundraiser a title</label>
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Donate to help..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tell your story</label>
          <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Who are you raising funds for? Why is this cause important? How will the funds be used?"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Start date</label>
            <input
              type="date"
              value={todayYyyyMmDd}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">End date</label>
            <input
              required
              type="date"
              min={minEndDate}
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="space-y-4">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Where will donations be sent?</h2>
        <p className="text-sm text-slate-600">Pick your receive wallet. If no wallet exists, connect MetaMask first.</p>

        <select
          required
          disabled={loadingWallet || wallets.length === 0}
          value={formData.receiveWalletAddress}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              receiveWalletAddress: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Select wallet</option>
          {wallets.map((wallet) => (
            <option key={wallet.address} value={wallet.address}>
              {wallet.address}
              {wallet.isPrimary ? " (Primary)" : ""}
            </option>
          ))}
        </select>

        <SecondaryButton
          type="button"
          onClick={connectWallet}
          disabled={connectingWallet}
          className="w-full rounded-xl border border-emerald-600 text-emerald-700"
        >
          {connectingWallet ? "Connecting..." : "Connect Wallet"}
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Review your fundraiser</h2>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Beneficiary</p>
        <p className="mt-1 text-base text-slate-900">{beneficiary === "yourself" ? "Yourself" : "Someone else"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover image</p>
        {selectedImagePreviews[0] ? (
          <Image
            src={selectedImagePreviews[0]}
            alt="Campaign cover preview"
            width={900}
            height={360}
            className="mt-3 h-56 w-full rounded-xl object-cover"
            unoptimized
          />
        ) : (
          <p className="mt-1 text-sm text-slate-700">No image selected</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{formData.title || "-"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fundraising details</p>
        <p className="mt-1 text-sm text-slate-800">Goal: {formatCurrency(formData.goalAmount)}</p>
        <p className="mt-1 text-sm text-slate-800">Category: {categoryLabelMap[formData.category] ?? "General"}</p>
        <p className="mt-1 text-sm text-slate-800">Country: {country}</p>
        <p className="mt-1 text-sm text-slate-800">Postcode: {postcode || "-"}</p>
        <p className="mt-1 text-sm text-slate-800">End date: {formData.endDate || "-"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Story</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">{formData.description || "-"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receive wallet</p>
        <p className="mt-1 break-all text-sm text-slate-900">{formData.receiveWalletAddress || "-"}</p>
      </div>
    </div>
  );
}
