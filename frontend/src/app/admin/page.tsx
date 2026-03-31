'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Trang quản trị</h1>
      <p className="text-gray-600 mb-6">
        Đây là khu vực dành cho admin để duyệt bài, quản lý chiến dịch và người dùng.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-100">
          <h2 className="font-semibold text-gray-800 mb-2">Chiến dịch chờ duyệt</h2>
          <p className="text-sm text-gray-500">
            Sau này bạn có thể hiển thị danh sách campaign ở trạng thái pending tại đây.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-100">
          <h2 className="font-semibold text-gray-800 mb-2">Báo cáo đóng góp</h2>
          <p className="text-sm text-gray-500">
            Khu vực thống kê số tiền quyên góp, số lượt ủng hộ, v.v.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-100">
          <h2 className="font-semibold text-gray-800 mb-2">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500">
            Dự kiến trang quản lý quyền hạn, khóa / mở tài khoản, ...
          </p>
        </div>
      </div>
    </div>
  );
}
