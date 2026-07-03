"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { Package } from "@/lib/types";

// ═══════════════════════════════════════════════════════════
// Package Context — Global State Management
// ═══════════════════════════════════════════════════════════

interface PackageContextType {
  // Data
  packages: Package[];
  filteredPackages: Package[];
  selectedPackage: Package | null;
  searchQuery: string;
  unreadCount: number;
  loading: boolean;

  // Actions
  selectPackage: (pkg: Package) => void;
  setSearchQuery: (query: string) => void;
  addPackage: (trackingNumber: string, courierId?: string) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  markNotificationsRead: () => void;
}

const PackageContext = createContext<PackageContextType | null>(null);

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch packages on mount
  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        if (res.ok) {
          const data = await res.json();
          setPackages(data.packages || []);
          if (data.packages?.length > 0) {
            setSelectedPackage(data.packages[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  // ── Filtered packages based on search query ──
  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;

    const q = searchQuery.toLowerCase();
    return packages.filter(
      (pkg) =>
        pkg.trackingNumber.toLowerCase().includes(q) ||
        pkg.origin?.toLowerCase().includes(q) ||
        pkg.destination?.toLowerCase().includes(q) ||
        pkg.customer?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q) ||
        pkg.courierName?.toLowerCase().includes(q)
    );
  }, [packages, searchQuery]);

  // ── Select a package ──
  const selectPackage = useCallback((pkg: Package) => {
    setSelectedPackage(pkg);
  }, []);

  // ── Add a new package ──
  const addPackage = useCallback(
    async (trackingNumber: string, courierId?: string) => {
      if (packages.some((p) => p.trackingNumber === trackingNumber)) {
        console.warn("Package already tracked:", trackingNumber);
        return;
      }

      try {
        const res = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber, courierId }),
        });

        if (res.ok) {
          const data = await res.json();
          const newPackage = data.package;
          setPackages((prev) => [newPackage, ...prev]);
          setSelectedPackage(newPackage);
          setUnreadCount((prev) => prev + 1);
        } else {
          throw new Error("Failed to add package");
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [packages]
  );

  // ── Delete a package ──
  const deletePackage = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/packages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setSelectedPackage((prev) => (prev?.id === id ? null : prev));
      } else {
        throw new Error("Failed to delete package");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  // ── Mark all notifications as read ──
  const markNotificationsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      packages,
      filteredPackages,
      selectedPackage,
      searchQuery,
      unreadCount,
      loading,
      selectPackage,
      setSearchQuery,
      addPackage,
      deletePackage,
      markNotificationsRead,
    }),
    [
      packages,
      filteredPackages,
      selectedPackage,
      searchQuery,
      unreadCount,
      loading,
      selectPackage,
      setSearchQuery,
      addPackage,
      deletePackage,
      markNotificationsRead,
    ]
  );

  return (
    <PackageContext.Provider value={value}>{children}</PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error("usePackages must be used within a PackageProvider");
  }
  return context;
}
