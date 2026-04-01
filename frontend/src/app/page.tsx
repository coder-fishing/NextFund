'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import HeroSection from '@/components/Hero/HerroSection';
import ETHSection from '@/components/ETH/ETHSection';

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
		<>
			<HeroSection />
			<ETHSection />
		</>
  );
}
