"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { categoryOptions } from "@/const/campaigns";
import { CreateCampaignFooterActions } from "@/components/CreateCampaign/CreateCampaignFooterActions";
import { CreateCampaignLeftPanel } from "@/components/CreateCampaign/CreateCampaignLeftPanel";
import { CreateCampaignStepContent } from "@/components/CreateCampaign/CreateCampaignStepContent";
import { useCreateCampaignForm } from "@/hooks/createCampaign/useCreateCampaignForm";
import { useCreateCampaignMedia } from "@/hooks/createCampaign/useCreateCampaignMedia";
import { useCreateCampaignSubmit } from "@/hooks/createCampaign/useCreateCampaignSubmit";
import { useCreateCampaignWallet } from "@/hooks/createCampaign/useCreateCampaignWallet";
import { useCreateCampaignWizard } from "@/hooks/createCampaign/useCreateCampaignWizard";

const toYyyyMmDd = (date: Date): string => date.toISOString().split("T")[0];

export default function CreateCampaignPage() {
  const { data: session, status } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayYyyyMmDd = useMemo(() => toYyyyMmDd(today), [today]);
  const minEndDate = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toYyyyMmDd(tomorrow);
  }, [today]);
  const defaultEndDate = useMemo(() => {
    const inTwoWeeks = new Date(today);
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
    return toYyyyMmDd(inTwoWeeks);
  }, [today]);

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

  const { selectedFiles, selectedImagePreviews, handleFilesChange, clearFiles } = useCreateCampaignMedia();

  const nonAllCategories = useMemo(
    () => categoryOptions.filter((item) => item.value !== "all"),
    []
  );

  const categoryLabelMap = useMemo(() => {
    return nonAllCategories.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, [nonAllCategories]);

  const validateStep = (step: number): string | null => {
    if (step === 1 && (!formData.goalAmount || Number(formData.goalAmount) <= 0)) {
      return "Please enter a valid goal amount.";
    }

    if (step === 2 && selectedFiles.length === 0) {
      return "Please upload at least one image.";
    }

    if (step === 3) {
      if (!formData.title.trim()) {
        return "Please provide a title for your fundraiser.";
      }

      if (!formData.description.trim()) {
        return "Please provide your fundraiser story.";
      }

      if (!formData.endDate || formData.endDate < minEndDate) {
        return "End date must be at least tomorrow.";
      }
    }

    if (step === 4 && !formData.receiveWalletAddress) {
      return "Please choose a wallet to receive donations.";
    }

    return null;
  };

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
        receiveWalletAddress: walletAddressFromApi || prev.receiveWalletAddress,
      })),
  });

  const { submitting, uploadingImages, setLaunchIntent, handleSubmit } = useCreateCampaignSubmit({
    currentStep,
    reviewStep: 5,
    walletAddress,
    wallets,
    formData,
    selectedFiles,
    minEndDate,
    onResetAll: () => {
      clearFiles();
      resetForm();
      setCurrentStep(0);
    },
    setErrorMessage,
    setSuccessMessage,
  });

  const formatCurrency = (amount: string) => {
    if (!amount || Number.isNaN(Number(amount))) {
      return "-";
    }

    return `${Number(amount).toLocaleString("en-US")} VND`;
  };

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

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#f6f6f7]">
      <form onSubmit={handleSubmit} className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1600px] lg:grid-cols-[34%_66%]">
        <CreateCampaignLeftPanel currentStep={currentStep} isReviewStep={isReviewStep} />

        <section className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white px-6 py-8 sm:px-10 lg:px-16">
          <div className="flex flex-1">
            <div className="mx-auto w-full max-w-6xl pb-6 pt-3 sm:pt-6">
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
              todayYyyyMmDd={todayYyyyMmDd}
              minEndDate={minEndDate}
              loadingWallet={loadingWallet}
              wallets={wallets}
              connectWallet={connectWallet}
              connectingWallet={connectingWallet}
              categoryLabelMap={categoryLabelMap}
              formatCurrency={formatCurrency}
            />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            {errorMessage && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}
            {successMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <CreateCampaignFooterActions
              currentStep={currentStep}
              reviewStep={5}
              submitting={submitting}
              uploadingImages={uploadingImages}
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
