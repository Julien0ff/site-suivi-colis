"use client";

import { Search, Bell, ChevronDown, X, User } from "lucide-react";
import { usePackages } from "@/contexts/PackageContext";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { packages, selectPackage, searchQuery, setSearchQuery, unreadCount, markNotificationsRead } =
    usePackages();
  const { data: session } = useSession();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
      {/* Search Bar — Real-time filtering */}
      <div className="relative w-full max-w-sm">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.8}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search packages, routes, customers..."
          className="h-10 w-full rounded-[var(--radius-input)] border border-border bg-surface pl-10 pr-9 text-xs font-medium text-foreground placeholder:text-muted outline-none transition-all duration-200 focus:border-foreground focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Right side — Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell — Dynamic */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (unreadCount > 0) markNotificationsRead();
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-border-subtle"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-red text-[9px] font-bold text-white animate-pulse-neon">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 z-50 w-72 animate-fade-in rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-card-hover">
              <p className="text-xs font-semibold text-foreground">
                Notifications
              </p>
              <div className="mt-3 space-y-2">
                {packages.length === 0 ? (
                  <p className="text-center text-[10px] text-muted-foreground py-2">
                    No recent updates
                  </p>
                ) : (
                  packages.slice(0, 3).map((pkg) => (
                    <div
                      key={pkg.id}
                      className="cursor-pointer rounded-lg bg-surface-alt p-3 transition-colors hover:bg-border-subtle"
                      onClick={() => {
                        selectPackage(pkg);
                        setShowNotifDropdown(false);
                      }}
                    >
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                        {pkg.status.toUpperCase() === "DELIVERED" ? "✅" : "📦"} {pkg.trackingNumber}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                        Status: {pkg.status.replace(/_/g, " ").toLowerCase()} ({pkg.courierName})
                      </p>
                    </div>
                  ))
                )}
              </div>
              <button className="mt-3 w-full text-center text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-border-subtle"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neon-purple to-neon-blue">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <span className="text-xs font-medium text-foreground">
              {session?.user?.name || "Guest"}
            </span>
            <ChevronDown
              className="h-3.5 w-3.5 text-muted transition-transform duration-200 group-hover:translate-y-0.5"
              strokeWidth={2}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-12 z-50 w-48 animate-fade-in rounded-[var(--radius-card)] border border-border bg-surface p-2 shadow-card-hover">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-border-subtle"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
