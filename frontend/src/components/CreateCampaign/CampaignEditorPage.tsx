"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CreateCampaignFooterActions } from "@/components/CreateCampaign/CreateCampaignFooterActions";
import { CreateCampaignLeftPanel } from "@/components/CreateCampaign/CreateCampaignLeftPanel";
import { CreateCampaignStepContent } from "@/components/CreateCampaign/CreateCampaignStepContent";
import { useCampaignEditorCalendar, useCampaignEditorShared } from "@/hooks/createCampaign/useCampaignEditorShared";
import { useCreateCampaignForm } from "@/hooks/createCampaign/useCreateCampaignForm";
import { useCreateCampaignMedia } from "@/hooks/createCampaign/useCreateCampaignMedia";
import { useCreateCampaignSubmit } from "@/hooks/createCampaign/useCreateCampaignSubmit";
import { useCreateCampaignWallet } from "@/hooks/createCampaign/useCreateCampaignWallet";
import { useCreateCampaignWizard } from "@/hooks/createCampaign/useCreateCampaignWizard";
import { Campaign, getCampaignById } from "@/services/campaignService";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  campaignId?: string;
  backHref?: string;
  backLabel?: string;
};

export function CampaignEditorPage({
  mode,
  campaignId,
  backHref,
  backLabel,
}: Props) {
  const isEditMode = mode === "edit";
  const { data: session, status } = useSession();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(isEditMode);
  const [campaignStartDate, setCampaignStartDate] = useState<string>("");

  const { toYyyyMmDd, todayYyyyMmDd, minEndDate, defaultEndDate } = useCampaignEditorCalendar();

  const {
    formData,
    setFormData,
    beneficiary,
    setBeneficiary,
    country,
    setCountry,
    postcode,
    setPostcode,
    resetForm,
  } = useCreateCampaignForm({ defaultEndDate });

  const {
    selectedFiles,
    existingImageUrls,
    setExistingImageUrls,
    selectedImagePreviews,
    handleFilesChange,
    clearFiles,
  } = useCreateCampaignMedia({ replaceExistingOnUpload: isEditMode });

  const {
    nonAllCategories,
    categoryLabelMap,
    validateStep,
    formatCurrency,
  } = useCampaignEditorShared({
    formData,
    selectedImagePreviews,
    minEndDate,
  });

  const { currentStep, setCurrentStep, isReviewStep, goNextStep, goPreviousStep } = useCreateCampaignWizard({
    totalSteps: 5,
    validateStep,
    setErrorMessage,
  });

  const { walletAddress, wallets, loadingWallet, connectingWallet, connectWallet } = useCreateCampaignWallet({
    userEmail: session?.user?.email,
    onError: (message) => setErrorMessage(message || null),
    onReceiveWalletPrefill: (walletAddressFromApi) =>
      setFormData((prev) => ({
        ...prev,
        receiveWalletAddress: prev.receiveWalletAddress || walletAddressFromApi,
      })),
  });

  const { submitting, uploadingImages, setLaunchIntent, handleSubmit } = useCreateCampaignSubmit({
    mode,
    campaignId,
    currentStep,
    reviewStep: 5,
    walletAddress,
    wallets,
    formData,
    selectedFiles,
    existingImageUrls,
    minEndDate,
    onResetAll: () => {
      if (isEditMode) {
        return;
      }

      clearFiles();
      resetForm();
      setCurrentStep(0);
    },
    setErrorMessage,
    setSuccessMessage,
  });

  useEffect(() => {
    const userEmail = session?.user?.email;

    if (!isEditMode || !campaignId || !userEmail) {
      return;
    }

    let cancelled = false;

    const loadCampaign = async () => {
      setLoadingCampaign(true);
      setErrorMessage(null);

      const campaign = (await getCampaignById(campaignId)) as Campaign | null;
      if (cancelled) {
        return;
      }

      if (!campaign) {
        setErrorMessage("Campaign not found.");
        setLoadingCampaign(false);
        return;
      }

      if ((campaign.creator ?? "").toLowerCase() !== userEmail.toLowerCase()) {
        setErrorMessage("You do not have permission to edit this campaign.");
        setLoadingCampaign(false);
        return;
      }

      if (campaign.deletedAt) {
        setErrorMessage("Deleted campaign cannot be edited.");
        setLoadingCampaign(false);
        return;
      }

      const startDate = campaign.createdAt ? toYyyyMmDd(new Date(campaign.createdAt)) : todayYyyyMmDd;
      setCampaignStartDate(startDate);

      setFormData((prev) => ({
        ...prev,
        title: campaign.title ?? "",
        description: campaign.description ?? "",
        category: campaign.category ?? "general",
        goalAmount: String(campaign.goalAmount ?? ""),
        endDate: campaign.endDate ? toYyyyMmDd(new Date(campaign.endDate)) : defaultEndDate,
        receiveWalletAddress: campaign.receiveWalletAddress ?? "",
      }));

      setExistingImageUrls(Array.isArray(campaign.image) ? campaign.image : []);
      setCurrentStep(5);
      setLoadingCampaign(false);
    };

    void loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [
    campaignId,
    defaultEndDate,
    isEditMode,
    session?.user?.email,
    setCurrentStep,
    setExistingImageUrls,
    setFormData,
    todayYyyyMmDd,
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (isEditMode && !campaignId) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Invalid campaign id.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#f6f6f7]">
      <form onSubmit={handleSubmit} className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-400 lg:grid-cols-[34%_66%]">
        <CreateCampaignLeftPanel currentStep={currentStep} isReviewStep={isReviewStep} />

        <section className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white px-6 py-8 sm:px-10 lg:px-16">
          {isEditMode && backHref && backLabel && (
            <div className="mb-4 text-sm text-slate-600">
              <Link href={backHref} className="font-medium text-slate-700 underline underline-offset-2">
                {backLabel}
              </Link>
            </div>
          )}

          <div className="flex flex-1">
            <div className="mx-auto w-full max-w-6xl pb-6 pt-3 sm:pt-6">
              {isEditMode && loadingCampaign ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading campaign details...
                </div>
              ) : (
                <CreateCampaignStepContent
                  currentStep={currentStep}
                  onEditStep={(step) => setCurrentStep(step)}
                  beneficiary={beneficiary}
                  setBeneficiary={setBeneficiary}
                  country={country}
                  setCountry={setCountry}
                  postcode={postcode}
                  setPostcode={setPostcode}
                  formData={formData}
                  setFormData={setFormData}
                  nonAllCategories={nonAllCategories}
                  selectedImagePreviews={selectedImagePreviews}
                  handleFilesChange={handleFilesChange}
                  todayYyyyMmDd={campaignStartDate || todayYyyyMmDd}
                  minEndDate={minEndDate}
                  loadingWallet={loadingWallet}
                  wallets={wallets}
                  connectWallet={connectWallet}
                  connectingWallet={connectingWallet}
                  categoryLabelMap={categoryLabelMap}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            {errorMessage && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}
            {successMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
            )}

            <CreateCampaignFooterActions
              currentStep={currentStep}
              reviewStep={5}
              submitting={submitting}
              uploadingImages={uploadingImages}
              submitLabel={isEditMode ? "Update fundraiser" : "Launch fundraiser"}
              onBack={goPreviousStep}
              onContinue={goNextStep}
              onLaunchClick={() => setLaunchIntent(true)}
            />
          </div>
        </section>
      </form>
    </div>
  );
}
