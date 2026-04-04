export const getDaysLeft = (endDate?: string): string => {
  if (!endDate) return "No deadline";

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} days left`;
  if (diffDays === 0) return "Ends today";
  return "Ended";
};

export const isEnded = (endDate?: string): boolean => {
  if (!endDate) return false;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return false;

  return end.getTime() < Date.now();
};
