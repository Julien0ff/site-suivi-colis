"use client";

import { SessionProvider } from "next-auth/react";
import { PackageProvider } from "@/contexts/PackageContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════════════════
// Dashboard Layout — Shared across all dashboard pages
// Includes Sidebar + Header + auth session
// ═══════════════════════════════════════════════════════════

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <PackageProvider>
        <div className="flex h-[100dvh] overflow-hidden bg-background flex-col md:flex-row">
          <Sidebar />
          <main className="ml-0 md:ml-[72px] mb-16 md:mb-0 flex flex-1 flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-hidden">{children}</div>
          </main>
        </div>
      </PackageProvider>
    </SessionProvider>
  );
}
