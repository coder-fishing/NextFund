import { FormEvent, useState } from "react";
import { uploadImage } from "@/services/upImageToClound";
import type { CreateCampaignFormData, WalletItem } from "@/app/campaigns/create/types";
import { updateMyCampaign } from "@/services/campaignService";

type Args = {
  mode?: "create" | "edit";
  campaignId?: string;
  currentStep: number;
  reviewStep: number;
  walletAddress: string | null;
  wallets: WalletItem[];
  formData: CreateCampaignFormData;
  selectedFiles: File[];
  existingImageUrls?: string[];
  minEndDate: string;
  onResetAll: () => void;
  setErrorMessage: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
};

export function useCreateCampaignSubmit({
  mode = "create",
  campaignId,
  currentStep,
  reviewStep,
  walletAddress,
  wallets,
  formData,
  selectedFiles,
  existingImageUrls = [],
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

    const isEditMode = mode === "edit";

    if (currentStep < reviewStep || !launchIntent) {
      setErrorMessage(
        isEditMode
          ? "Please review all steps, then click Update fundraiser to save changes."
          : "Please review all steps, then click Launch fundraiser to create campaign."
      );
      return;
    }

    setLaunchIntent(false);

    if (!walletAddress || wallets.length === 0) {
      setErrorMessage(
        isEditMode
          ? "You must connect at least one wallet before updating a campaign."
          : "You must connect at least one wallet before creating a campaign."
      );
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

    if (selectedFiles.length === 0 && existingImageUrls.length === 0) {
      setErrorMessage("Please upload at least one image.");
      return;
    }

    if (isEditMode && !campaignId) {
      setErrorMessage("Campaign id is missing.");
      return;
    }

    setSubmitting(true);
    setUploadingImages(selectedFiles.length > 0);

    try {
      const uploadedImageUrls =
        selectedFiles.length > 0
          ? await Promise.all(selectedFiles.map((file) => uploadImage(file)))
          : [];
      setUploadingImages(false);

      // In edit mode, uploading any new image replaces all old images.
      const finalImages =
        selectedFiles.length > 0 ? uploadedImageUrls : existingImageUrls;

      if (isEditMode) {
        const updated = await updateMyCampaign(campaignId as string, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          goalAmount: Number(formData.goalAmount),
          endDate: new Date(formData.endDate).toISOString(),
          image: finalImages,
          receiveWalletAddress: formData.receiveWalletAddress,
        });

        if (!updated) {
          throw new Error("Update campaign failed.");
        }

        setSuccessMessage("Campaign updated successfully.");
        return;
      }

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
          image: finalImages,
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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : mode === "edit"
          ? "Update campaign failed."
          : "Create campaign failed."
      );
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
