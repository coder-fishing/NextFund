import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import Navbar from "@/components/Nav/Navbar";
import { auth } from "@/auth";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MyApp - Đăng nhập với Google/Facebook",
  description: "Ứng dụng Next.js với OAuth authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="vi">
      <body className={`${mulish.className} antialiased`}>
        <AuthSessionProvider session={session}>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
