'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';
import LogoutButton from '../Button/LogoutButton';

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function UserMenu({ name, email, image }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* User Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        {image && (
          <Image
            src={image}
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="hidden sm:block text-xs leading-tight text-right">
          <p className="font-semibold text-gray-800 truncate max-w-[120px]">{name}</p>
        </div>
        {/* Dropdown arrow icon */}
        <Image
          src="/dropdown.svg"
          alt="Dropdown Arrow"
          width={12}
          height={12}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
          {/* <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div> */}

          <nav className="py-1">
            <Link
              href="/wallet"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
            >
               My Wallet
            </Link>
            <Link
              href="/campaigns/mycampaigns"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
            >
               My Campaigns
            </Link>
          </nav>

          <div className="border-t border-slate-100 p-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
