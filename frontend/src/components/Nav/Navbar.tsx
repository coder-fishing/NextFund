'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserMenu } from './UserMenu';
import {
  ADMIN_NAV_LINK,
  PROTECTED_NAV_LINKS,
  PUBLIC_NAV_LINKS,
} from '@/config/navigation';
import { NavLink } from './NavLink';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);

    if (nextIsDark) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              <h1>NextFund</h1>
            </Link>

            {/* Hamburger Button - Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
            >
              <svg
                className={`h-5 w-5 transition-transform ${isOpen}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
            {PUBLIC_NAV_LINKS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}

            {session &&
              PROTECTED_NAV_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                />
              ))}

            {session?.user?.role === 'admin' && (
              <NavLink
                item={ADMIN_NAV_LINK}
                pathname={pathname}
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Chuyển chế độ sáng/tối"
              className="p-2 hover:cursor-pointer transition-colors text-lg"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {!session && (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </Link>
            )}

            {session?.user && (
              <UserMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-2 py-3 space-y-2">
            {PUBLIC_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    ? 'bg-slate-100 text-blue-600'
                    : 'text-gray-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {session && (
              <>
                <div className="border-t border-slate-200 my-2" />
                {PROTECTED_NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        ? 'bg-slate-100 text-emerald-600'
                        : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {session.user?.role === 'admin' && (
                  <Link
                    href={ADMIN_NAV_LINK.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === ADMIN_NAV_LINK.href || pathname?.startsWith(ADMIN_NAV_LINK.href)
                        ? 'bg-slate-100 text-rose-600'
                        : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    {ADMIN_NAV_LINK.label}
                  </Link>
                )}
              </>
            )}

            {!session && (
              <>
                <div className="border-t border-slate-200 my-2" />
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
