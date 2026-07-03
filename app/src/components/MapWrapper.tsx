"use client";

import dynamic from "next/dynamic";
import { Package } from "@/lib/types";
import { MapPin } from "lucide-react";

// ── Dynamic import to prevent SSR (Leaflet needs `window`) ──
const MapViewer = dynamic(() => import("./MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface">
      <div className="flex flex-col items-center gap-2 text-muted">
        <MapPin className="h-6 w-6 animate-pulse" />
        <p className="text-xs font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  selectedPackage: Package | null;
  packages: Package[];
}

export default function MapWrapper({
  selectedPackage,
  packages,
}: MapWrapperProps) {
  return (
    <MapViewer selectedPackage={selectedPackage} packages={packages} />
  );
}
