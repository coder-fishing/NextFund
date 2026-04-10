import { useState } from "react";
import type { BeneficiaryType, CreateCampaignFormData } from "@/app/campaigns/create/types";

type Args = {
  defaultEndDate: string;
};

export function useCreateCampaignForm({ defaultEndDate }: Args) {
  const [beneficiary, setBeneficiary] = useState<BeneficiaryType>("yourself");
  const [country, setCountry] = useState("Vietnam");
  const [postcode, setPostcode] = useState("");

  const [formData, setFormData] = useState<CreateCampaignFormData>({
    title: "",
    description: "",
    category: "general",
    goalAmount: "",
    endDate: defaultEndDate,
    receiveWalletAddress: "",
  });

  const resetForm = () => {
    setBeneficiary("yourself");
    setCountry("Vietnam");
    setPostcode("");
    setFormData({
      title: "",
      description: "",
      category: "general",
      goalAmount: "",
      endDate: defaultEndDate,
      receiveWalletAddress: "",
    });
  };

  return {
    formData,
    setFormData,
    beneficiary,
    setBeneficiary,
    country,
    setCountry,
    postcode,
    setPostcode,
    resetForm,
  };
}
