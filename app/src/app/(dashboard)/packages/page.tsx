"use client";

import { usePackages } from "@/contexts/PackageContext";
import PackageListItem from "@/components/PackageListItem";
import { PackageSearch } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Packages Page — Full list view of all tracked packages
// ═══════════════════════════════════════════════════════════

export default function PackagesPage() {
  const { filteredPackages, selectPackage, searchQuery } = usePackages();

  return (
    <div className="flex h-full w-full flex-col px-8 pb-6 pt-6">
      <h2 className="text-lg font-bold text-foreground">All Packages</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        View and manage all your tracked shipments.
      </p>

      <div className="mt-6 flex flex-1 flex-col overflow-y-auto">
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPackages.map((pkg) => (
              <PackageListItem
                key={pkg.id}
                pkg={pkg}
                isSelected={false}
                onSelect={(pkg) => {
                  // select package and redirect to dashboard map
                  selectPackage(pkg);
                  window.location.href = "/";
                }}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted animate-fade-in">
            <PackageSearch className="h-12 w-12 opacity-40" />
            <p className="text-sm font-medium">
              No packages match &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted animate-fade-in">
            <PackageSearch className="h-12 w-12 opacity-40" />
            <p className="text-sm font-medium">No tracked packages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
