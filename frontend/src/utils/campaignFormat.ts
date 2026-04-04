export const formatVnd = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

export const formatDate = (input?: string): string => {
  if (!input) return "Unknown";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};
