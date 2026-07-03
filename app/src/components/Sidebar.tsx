"use client";

import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Hexagon,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "packages", icon: Package, label: "Packages", href: "/packages" },
  { id: "profile", icon: User, label: "Profile", href: "/profile" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 md:top-0 left-0 z-50 flex h-16 md:h-full w-full md:w-[72px] flex-row md:flex-col items-center justify-between bg-sidebar px-4 md:px-0 md:py-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-sidebar">
      {/* Desktop Logo */}
      <Link
        href="/"
        className="hidden group md:flex h-11 w-11 items-center justify-center rounded-[14px] bg-sidebar-foreground transition-transform duration-200 hover:scale-105"
        aria-label="TrackFlow Home"
      >
        <Hexagon
          className="h-5 w-5 text-sidebar transition-transform duration-200 group-hover:rotate-45"
          strokeWidth={2.5}
        />
      </Link>

      {/* Navigation */}
      <nav className="flex w-full flex-row items-center justify-around gap-1 md:mt-8 md:w-full md:flex-1 md:flex-col md:justify-start md:gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex h-12 w-12 md:h-11 md:w-11 flex-col md:flex-row items-center justify-center rounded-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-accent hover:bg-sidebar-muted hover:text-sidebar-foreground"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-5 w-5 md:h-[18px] md:w-[18px]" strokeWidth={1.8} />

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 md:-right-[2px] md:bottom-auto md:top-1/2 h-1.5 w-1.5 md:-translate-y-1/2 rounded-full bg-sidebar-foreground" />
              )}

              {/* Tooltip (Desktop only) */}
              <span className="hidden md:block pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Logout (Mobile places it alongside nav items, desktop at the bottom) */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group relative flex h-12 w-12 md:h-11 md:w-11 md:mt-auto items-center justify-center rounded-[14px] text-sidebar-accent transition-all duration-200 hover:bg-neon-red/10 hover:text-neon-red"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-5 w-5 md:h-[18px] md:w-[18px]" strokeWidth={1.8} />
          {/* Tooltip (Desktop only) */}
          <span className="hidden md:block pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}
