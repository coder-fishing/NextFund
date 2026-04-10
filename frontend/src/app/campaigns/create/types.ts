export type WalletItem = {
  _id?: string;
  address: string;
  isPrimary: boolean;
};

export type CreateCampaignFormData = {
  title: string;
  description: string;
  category: string;
  goalAmount: string;
  endDate: string;
  receiveWalletAddress: string;
};

export type BeneficiaryType = "yourself" | "someoneElse";
