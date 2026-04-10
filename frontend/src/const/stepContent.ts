type WizardStep = {
  heading: string;
  title: string;
  description: string;
};

export const stepContent: WizardStep[] = [
  {
    heading: "1 of 5",
    title: "Tell us who you're raising funds for",
    description: "This information helps us get to know you and your fundraising needs.",
  },
  {
    heading: "2 of 5",
    title: "Tell us how much you'd like to raise",
    description: "Set your goal and choose the category that best describes your fundraiser.",
  },
  {
    heading: "3 of 5",
    title: "Add media",
    description: "A bright, clear cover image helps people trust your fundraiser faster.",
  },
  {
    heading: "4 of 5",
    title: "Tell donors why you're fundraising",
    description: "Share your story clearly so supporters understand your cause.",
  },
  {
    heading: "5 of 5",
    title: "Choose where funds will be received",
    description: "Select a wallet for donations and connect one if needed.",
  },
];