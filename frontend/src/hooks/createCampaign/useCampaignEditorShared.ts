import { useCallback, useMemo } from "react";
import { categoryOptions } from "@/const/campaigns";
import type { CreateCampaignFormData } from "@/app/campaigns/create/types";

export type CampaignCategoryOption = {
  value: string;
  label: string;
};

const toYyyyMmDd = (date: Date): string => date.toISOString().split("T")[0];

type Args = {
  formData: CreateCampaignFormData;
  selectedImagePreviews: string[];
  minEndDate: string;
};

export function useCampaignEditorCalendar() {
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

  return {
    toYyyyMmDd,
    todayYyyyMmDd,
    minEndDate,
    defaultEndDate,
  };
}

export function useCampaignEditorShared({ formData, selectedImagePreviews, minEndDate }: Args) {

  const nonAllCategories = useMemo<CampaignCategoryOption[]>(
    () => categoryOptions.filter((item) => item.value !== "all"),
    []
  );

  const categoryLabelMap = useMemo(() => {
    return nonAllCategories.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, [nonAllCategories]);

  const validateStep = useCallback(
    (step: number): string | null => {
      if (step === 1 && (!formData.goalAmount || Number(formData.goalAmount) <= 0)) {
        return "Please enter a valid goal amount.";
      }

      if (step === 2 && selectedImagePreviews.length === 0) {
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
    },
    [formData, minEndDate, selectedImagePreviews.length]
  );

  const formatCurrency = useCallback((amount: string) => {
    if (!amount || Number.isNaN(Number(amount))) {
      return "-";
    }

    return `${Number(amount).toLocaleString("en-US")} VND`;
  }, []);

  return {
    nonAllCategories,
    categoryLabelMap,
    validateStep,
    formatCurrency,
  };
}
