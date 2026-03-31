'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Đăng xuất"
      title="Đăng xuất"
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
    >
      <>
      {/* <Image
        src="/logout.svg"
        alt="logout"
        width={16}
        height={16}
      /> */}
      Logout
      </>
       
    </button>
  );
}
