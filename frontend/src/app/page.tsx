'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Chào mừng đến MyApp
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Một ứng dụng Next.js xây dựng với OAuth authentication từ Google và Facebook
        </p>

        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
        >
          Đăng Nhập Ngay
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔐 An Toàn</h3>
            <p className="text-gray-600">Xác thực qua OAuth2 từ Google và Facebook</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ Nhanh Chóng</h3>
            <p className="text-gray-600">Xây dựng với Next.js 16 và TypeScript</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎨 Đẹp Mắt</h3>
            <p className="text-gray-600">Giao diện hiện đại với Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
