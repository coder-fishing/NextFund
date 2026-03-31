'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function WalletPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Ví & thanh toán</h1>
      <p className="text-gray-600 mb-6">
        Đây là trang placeholder cho phần quản lý ví / thanh toán. Bạn có thể
        tái sử dụng API wallet đã có ở backend để hiển thị và cấu hình ví tại
        đây.
      </p>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-gray-500">
        Placeholder nội dung ví.
      </div>
    </div>
  );
}
