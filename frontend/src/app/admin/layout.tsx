import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — NextFund",
  description: "Quản lý campaigns và users trên nền tảng NextFund",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
