'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold text-blue-600">
            MyApp
          </div>

          {session?.user && (
            <div className="flex items-center gap-4">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="text-sm">
                <p className="font-semibold text-gray-800">
                  {session.user.name}
                </p>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
