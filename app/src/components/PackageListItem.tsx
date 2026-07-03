"use client";

import { Package } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { Truck, Plane, Ship, Package as PackageIcon } from "lucide-react";

interface PackageListItemProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: (pkg: Package) => void;
}

const COURIER_ICONS: Record<string, React.ElementType> = {
  fedex: Plane,
  dhl: Truck,
  ups: Truck,
  dpd: Truck,
  gls: Ship,
};

export default function PackageListItem({
  pkg,
  isSelected,
  onSelect,
}: PackageListItemProps) {
  const CourierIcon = COURIER_ICONS[pkg.courierId] || PackageIcon;

  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group flex w-full items-center gap-3.5 rounded-[14px] border px-4 py-3.5 text-left transition-all duration-200 ${
        isSelected
          ? "border-foreground/15 bg-surface shadow-card-hover"
          : "border-transparent bg-transparent hover:border-border-subtle hover:bg-surface hover:shadow-card"
      }`}
    >
      {/* Courier Icon */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] transition-colors duration-200 ${
          isSelected ? "bg-foreground text-background" : "bg-border-subtle text-muted-foreground group-hover:bg-border"
        }`}
      >
        <CourierIcon className="h-4 w-4" strokeWidth={1.8} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">
          {pkg.trackingNumber}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {pkg.origin} → {pkg.destination}
        </p>
      </div>

      {/* Status */}
      <StatusBadge status={pkg.status} size="sm" />
    </button>
  );
}
