import {
  type NavLinkItem,
  type NavLinkVariant,
} from "@/config/navigation";
import Link from "next/link";

type NavLinkProps = {
  item: NavLinkItem;
  pathname: string | null;
};

const VARIANT_CLASSES: Record<NavLinkVariant, { active: string; inactive: string }> = {
  public: {
    active: "text-blue-600 bg-blue-50",
    inactive: "hover:text-blue-600 hover:bg-slate-50",
  },
  dashboard: {
    active: "text-emerald-600 bg-emerald-50",
    inactive: "text-emerald-700 hover:bg-emerald-50",
  },
  wallet: {
    active: "text-violet-600 bg-violet-50",
    inactive: "text-violet-700 hover:bg-violet-50",
  },
  admin: {
    active: "text-rose-600 bg-rose-50",
    inactive: "text-rose-700 hover:bg-rose-50",
  },
};

export const NavLink = ({ item, pathname }: NavLinkProps) => {
  const isActive = (() => {
    if (!pathname) return false;
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  })();

  const variant: NavLinkVariant = item.variant ?? 'public';
  const { active, inactive } = VARIANT_CLASSES[variant];

  return (
    <Link
      href={item.href}
      className={`px-2 py-1 rounded-full transition-colors ${
        isActive ? active : inactive
      }`}
    >
      {item.label}
    </Link>
  );
}