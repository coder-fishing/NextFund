export const DONATION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DONATION_CONTRACT || "";

export const DONATION_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "DonationSent",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "campaignId", type: "uint256" },
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
