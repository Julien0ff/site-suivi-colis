"use client";

import { usePackages } from "@/contexts/PackageContext";
import AddPackageForm from "@/components/AddPackageForm";
import PackageCard from "@/components/PackageCard";
import PackageListItem from "@/components/PackageListItem";
import MapWrapper from "@/components/MapWrapper";
import { PackageSearch } from "lucide-react";

export default function DashboardPage() {
  const {
    filteredPackages,
    selectedPackage,
    selectPackage,
    searchQuery,
    packages,
  } = usePackages();

  const otherPackages = filteredPackages.filter(
    (p: any) => p.id !== selectedPackage?.id
  );

  const selectedInResults =
    selectedPackage &&
    (!searchQuery ||
      filteredPackages.some((p: any) => p.id === selectedPackage.id));

  return (
    <div className="flex h-full w-full flex-col md:flex-row gap-4 md:gap-6 overflow-hidden px-4 md:px-8 pb-4 md:pb-6 pt-4 md:pt-6">
      {/* LEFT COLUMN — Package List */}
      <div className="flex w-full md:w-[480px] flex-shrink-0 flex-col gap-4 overflow-y-auto pr-1 md:pr-2 order-2 md:order-1">
        {/* Add Package Form */}
        <div className="animate-fade-in">
          <AddPackageForm />
        </div>

        {/* Selected Package — Detailed Card */}
        {selectedInResults && (
          <div
            className="animate-fade-in"
            style={{ animationDelay: "60ms" }}
          >
            <PackageCard pkg={selectedPackage} />
          </div>
        )}

        {/* Other Packages — Compact List */}
        {otherPackages.length > 0 ? (
          <div className="stagger-children flex flex-col gap-1">
            {otherPackages.map((pkg: any) => (
              <PackageListItem
                key={pkg.id}
                pkg={pkg}
                isSelected={false}
                onSelect={selectPackage}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted animate-fade-in">
            <PackageSearch className="h-8 w-8 opacity-40" />
            <p className="text-xs font-medium">
              No packages match &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted animate-fade-in">
            <PackageSearch className="h-8 w-8 opacity-40" />
            <p className="text-xs font-medium">
              No packages yet. Add your first package above!
            </p>
          </div>
        ) : null}
      </div>

      {/* RIGHT COLUMN — Interactive Map */}
      <div
        className="h-[40vh] md:h-auto min-h-[250px] md:flex-1 animate-fade-in order-1 md:order-2 flex-shrink-0 overflow-hidden rounded-[var(--radius-card)]"
        style={{ animationDelay: "120ms" }}
      >
        <MapWrapper
          selectedPackage={selectedPackage || null}
          packages={packages}
        />
      </div>
    </div>
  );
}
