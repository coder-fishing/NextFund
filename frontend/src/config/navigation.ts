export type NavLinkVariant = 'public' | 'dashboard' | 'wallet' | 'admin';

export type NavLinkItem = {
  href: string;
  label: string;
  requiresAuth?: boolean;
  variant?: NavLinkVariant;
};

export const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { href: '/dashboard', label: 'Explore', variant: 'public' },
  { href: '/campaigns', label: 'Campaigns', variant: 'public' },
  { href: '/about', label: 'About', variant: 'public' },
];

export const PROTECTED_NAV_LINKS: NavLinkItem[] = [
    // { href: '/dashboard', label: 'Dashboard', requiresAuth: true, variant: 'dashboard' },
  { href: '/wallet', label: 'My Wallet', requiresAuth: true, variant: 'wallet' },
];

export const ADMIN_NAV_LINK: NavLinkItem = {
  href: '/admin',
  label: 'Admin',
  requiresAuth: true,
  variant: 'admin',
};
