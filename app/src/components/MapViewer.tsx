"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Package, STATUS_CONFIG } from "@/lib/types";
import StatusBadge from "./StatusBadge";

// ── Lazy-load Leaflet only on the client ──
let L: typeof import("leaflet") | null = null;
let RL: typeof import("react-leaflet") | null = null;

interface MapViewerProps {
  selectedPackage: Package | null;
  packages: Package[];
}

// ── Custom Marker Icons ──────────────────────────────────

function createPulsingIcon(): import("leaflet").DivIcon | undefined {
  if (!L) return undefined;
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:#0a0a0a;opacity:0.15;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#0a0a0a;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
      </div>
      <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

function createEndpointIcon(
  type: "origin" | "destination"
): import("leaflet").DivIcon | undefined {
  if (!L) return undefined;
  const color = type === "origin" ? "#22c55e" : "#3b82f6";
  return L.divIcon({
    className: "",
    html: `
      <div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function createDimmedIcon(): import("leaflet").DivIcon | undefined {
  if (!L) return undefined;
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:#a3a3a3;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2);opacity:0.6;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

// ── Map Controller (auto-fits bounds) ────────────────────

function MapController({
  bounds,
}: {
  bounds: [number, number][] | null;
}) {
  if (!RL) return null;
  const MapControllerInner = () => {
    const map = RL!.useMap();
    const boundsRef = useRef<string | null>(null);

    useEffect(() => {
      if (!bounds || bounds.length < 2) return;
      const key = JSON.stringify(bounds);
      if (boundsRef.current === key) return;
      boundsRef.current = key;

      map.flyToBounds(bounds, {
        padding: [60, 60],
        duration: 1.2,
        maxZoom: 8,
      });
    }, [bounds, map]);

    return null;
  };
  return <MapControllerInner />;
}

// ── Main Map Component ───────────────────────────────────

export default function MapViewer({
  selectedPackage,
  packages,
}: MapViewerProps) {
  const [ready, setReady] = useState(false);

  // Load Leaflet + react-leaflet on mount
  useEffect(() => {
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([leaflet, reactLeaflet]) => {
      L = leaflet;
      RL = reactLeaflet;
      setReady(true);
    });
  }, []);

  const pulsingIcon = useMemo(() => (ready ? createPulsingIcon() : undefined), [ready]);
  const originIcon = useMemo(
    () => (ready ? createEndpointIcon("origin") : undefined),
    [ready]
  );
  const destinationIcon = useMemo(
    () => (ready ? createEndpointIcon("destination") : undefined),
    [ready]
  );
  const dimmedIcon = useMemo(
    () => (ready ? createDimmedIcon() : undefined),
    [ready]
  );

  // Calculate bounds for the selected package
  const bounds = useMemo(() => {
    if (!selectedPackage) return null;
    const points: [number, number][] = [];
    if (selectedPackage.originCoords)
      points.push([selectedPackage.originCoords.lat, selectedPackage.originCoords.lng]);
    if (selectedPackage.destinationCoords)
      points.push([selectedPackage.destinationCoords.lat, selectedPackage.destinationCoords.lng]);
    if (selectedPackage.currentCoords)
      points.push([selectedPackage.currentCoords.lat, selectedPackage.currentCoords.lng]);
    return points.length >= 2 ? points : null;
  }, [selectedPackage]);

  // Route polyline points
  const routeLine = useMemo(() => {
    if (!selectedPackage) return [];
    const points: [number, number][] = [];
    if (selectedPackage.originCoords)
      points.push([selectedPackage.originCoords.lat, selectedPackage.originCoords.lng]);
    if (selectedPackage.currentCoords)
      points.push([selectedPackage.currentCoords.lat, selectedPackage.currentCoords.lng]);
    if (selectedPackage.destinationCoords)
      points.push([selectedPackage.destinationCoords.lat, selectedPackage.destinationCoords.lng]);
    return points;
  }, [selectedPackage]);

  const statusLabel = selectedPackage ? STATUS_CONFIG[selectedPackage.status].label : "";

  // Loading state
  if (!ready || !RL) {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface">
        <div className="flex flex-col items-center gap-2 text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-xs font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline } = RL;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
      <MapContainer
        center={[45.0, 2.0]}
        zoom={4}
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "#f8f8f8" }}
      >
        {/* Light monochrome tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Map auto-fit controller */}
        <MapController bounds={bounds} />

        {/* Route polyline — full route (solid) */}
        {routeLine.length >= 2 && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#0a0a0a",
              weight: 3,
              opacity: 0.6,
            }}
          />
        )}

        {/* Remaining route (dashed) */}
        {selectedPackage?.currentCoords && selectedPackage?.destinationCoords && (
          <Polyline
            positions={[
              [selectedPackage.currentCoords.lat, selectedPackage.currentCoords.lng],
              [selectedPackage.destinationCoords.lat, selectedPackage.destinationCoords.lng],
            ]}
            pathOptions={{
              color: "#a3a3a3",
              weight: 2,
              opacity: 0.5,
              dashArray: "8, 8",
            }}
          />
        )}

        {/* Origin marker */}
        {selectedPackage?.originCoords && originIcon && (
          <Marker
            position={[selectedPackage.originCoords.lat, selectedPackage.originCoords.lng]}
            icon={originIcon}
          >
            <Popup>
              <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                <strong>📍 Origin</strong><br />{selectedPackage.origin}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {selectedPackage?.destinationCoords && destinationIcon && (
          <Marker
            position={[selectedPackage.destinationCoords.lat, selectedPackage.destinationCoords.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                <strong>🏁 Destination</strong><br />{selectedPackage.destination}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current location — pulsing marker */}
        {selectedPackage?.currentCoords && pulsingIcon && (
          <Marker
            position={[selectedPackage.currentCoords.lat, selectedPackage.currentCoords.lng]}
            icon={pulsingIcon}
          >
            <Popup>
              <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                <strong>{selectedPackage.trackingNumber}</strong><br />
                <span style={{ color: selectedPackage.status === "in_transit" ? "#22c55e" : "#3b82f6" }}>
                  ● {statusLabel}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Other package markers (dimmed) */}
        {packages
          .filter((p) => p.id !== (selectedPackage?.id || "") && p.currentCoords)
          .map((pkg) =>
            dimmedIcon ? (
              <Marker
                key={pkg.id}
                position={[pkg.currentCoords!.lat, pkg.currentCoords!.lng]}
                icon={dimmedIcon}
              >
                <Popup>
                  <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                    <strong>{pkg.trackingNumber}</strong><br />
                    {pkg.origin} → {pkg.destination}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
      </MapContainer>

      {/* Floating info card */}
      {selectedPackage && (
        <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 animate-fade-in">
          <div className="glass flex items-center gap-3 rounded-[14px] border border-border px-4 py-2.5 shadow-card-hover">
            <div>
              <p className="text-[11px] font-bold text-foreground">
                {selectedPackage.trackingNumber}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {selectedPackage.origin} → {selectedPackage.destination}
              </p>
            </div>
            <StatusBadge status={selectedPackage.status} size="sm" />
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/80 px-2 py-1 text-[9px] text-muted backdrop-blur-sm">
        © OpenStreetMap · CARTO
      </div>
    </div>
  );
}
