import { FormEvent, useState } from "react";
import { uploadImage } from "@/services/upImageToClound";
import type { CreateCampaignFormData, WalletItem } from "@/app/campaigns/create/types";

type Args = {
  currentStep: number;
  reviewStep: number;
  walletAddress: string | null;
  wallets: WalletItem[];
  formData: CreateCampaignFormData;
  selectedFiles: File[];
  minEndDate: string;
  onResetAll: () => void;
  setErrorMessage: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
};

export function useCreateCampaignSubmit({
  currentStep,
  reviewStep,
  walletAddress,
  wallets,
  formData,
  selectedFiles,
  minEndDate,
  onResetAll,
  setErrorMessage,
  setSuccessMessage,
}: Args) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [launchIntent, setLaunchIntent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (currentStep < reviewStep || !launchIntent) {
      setErrorMessage("Please review all steps, then click Launch fundraiser to create campaign.");
      return;
    }

    setLaunchIntent(false);

    if (!walletAddress || wallets.length === 0) {
      setErrorMessage("You must connect at least one wallet before creating a campaign.");
      return;
    }

    if (!formData.receiveWalletAddress) {
      setErrorMessage("Please choose a wallet to receive donations.");
      return;
    }

    if (!formData.endDate || formData.endDate < minEndDate) {
      setErrorMessage("End date must be at least tomorrow.");
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage("Please upload at least one image.");
      return;
    }

    setSubmitting(true);
    setUploadingImages(true);

    try {
      const uploadedImageUrls = await Promise.all(selectedFiles.map((file) => uploadImage(file)));
      setUploadingImages(false);

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          goalAmount: Number(formData.goalAmount),
          endDate: new Date(formData.endDate).toISOString(),
          image: uploadedImageUrls,
          receiveWalletAddress: formData.receiveWalletAddress,
        }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Create campaign failed.");
      }

      setSuccessMessage("Campaign created successfully. Waiting for admin approval.");
      onResetAll();
      setLaunchIntent(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Create campaign failed.");
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  return {
    submitting,
    uploadingImages,
    launchIntent,
    setLaunchIntent,
    handleSubmit,
  };
}
