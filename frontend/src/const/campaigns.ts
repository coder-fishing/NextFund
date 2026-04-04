import type { CampaignCategory } from "@/services/campaignService";

export type CategoryFilter = "all" | CampaignCategory;

export const categoryOptions: Array<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "emergency", label: "Emergency" },
  { value: "animals", label: "Animals" },
  { value: "community", label: "Community" },
  { value: "general", label: "General" },
];

export const heroCopyByCategory: Record<CategoryFilter, { title: string; subtitle: string }> = {
  all: {
    title: "Discover fundraisers that need your support",
    subtitle: "Browse verified campaigns and choose a cause you want to stand with today.",
  },
  medical: {
    title: "Discover medical fundraisers",
    subtitle: "Help families cover treatment costs and urgent healthcare needs.",
  },
  education: {
    title: "Discover education fundraisers",
    subtitle: "Support scholarships, tuition, school projects, and learning opportunities.",
  },
  emergency: {
    title: "Discover emergency fundraisers",
    subtitle: "Back urgent relief campaigns for accidents, disasters, and critical events.",
  },
  animals: {
    title: "Discover animal fundraisers",
    subtitle: "Help rescue centers and pet owners fund care, treatment, and shelter.",
  },
  community: {
    title: "Discover community fundraisers",
    subtitle: "Contribute to local initiatives that strengthen neighborhoods and people.",
  },
  general: {
    title: "Discover general fundraisers",
    subtitle: "Explore meaningful campaigns created by people in need of support.",
  },
};
