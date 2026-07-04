"use client";

import { Package } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { Phone, MessageCircle, Trash2, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { usePackages } from "@/contexts/PackageContext";

interface PackageCardProps {
  pkg: Package;
}

/**
 * Calculates a delivery progress percentage based on departure and arrival dates.
 * Returns a value between 0 and 100.
 */
function calculateProgress(pkg: Package): number {
  // If delivered, 100%
  if (pkg.status === "delivered") return 100;
  // If packed (not yet departed), 5% (just to show activity)
  if (pkg.status === "packed") return 5;

  // Parse dates (handle formats like "22.08.21 16:40 PM")
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr === "—") return null;
    // Try standard parse first
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Try DD.MM.YY HH:mm format
    const match = dateStr.match(
      /(\d{2})\.(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2})/
    );
    if (match) {
      const [, day, month, year, hour, minute] = match;
      return new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
    }
    return null;
  };

  const departure = parseDate(pkg.departureDate);
  const arrival = parseDate(pkg.arrivalDate);

  if (!departure || !arrival) return 50; // Default if dates are unparseable

  const now = new Date();
  const total = arrival.getTime() - departure.getTime();
  const elapsed = now.getTime() - departure.getTime();

  if (total <= 0) return 50;
  const progress = Math.max(5, Math.min(95, (elapsed / total) * 100));
  return Math.round(progress);
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const { deletePackage } = usePackages();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useMemo(() => calculateProgress(pkg), [pkg]);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${pkg.trackingNumber}?`)) {
      setIsDeleting(true);
      try {
        await deletePackage(pkg.id!);
      } catch (err) {
        setIsDeleting(false);
        console.error("Failed to delete", err);
      }
    }
  };

  return (
    <div className={`w-full rounded-[var(--radius-card)] border border-foreground/10 bg-surface p-5 shadow-card-hover ring-1 ring-foreground/5 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header: Tracking + Status */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Tracking Number
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">
              {pkg.trackingNumber}
            </p>
            <button
              onClick={handleDelete}
              className="group rounded bg-neon-red/10 p-1.5 text-neon-red transition-all hover:bg-neon-red hover:text-white"
              aria-label="Delete package"
            >
              <Trash2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" strokeWidth={2} />
            </button>
          </div>
        </div>
        <StatusBadge status={pkg.status} />
      </div>

      {/* Departure / Arrival with Progress Bar */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Departure
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.departureDate}
          </p>
        </div>

        {/* Dynamic Progress Route */}
        <div className="relative flex flex-1 items-center px-1">
          {/* Background track */}
          <div className="h-[2px] w-full rounded-full bg-border" />

          {/* Progress fill */}
          <div
            className="absolute left-0 h-[2px] rounded-full bg-foreground transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />

          {/* Origin dot */}
          <div className="absolute -left-1 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-surface" />

          {/* Current position indicator */}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.2)] transition-all duration-700 ease-out"
            style={{ left: `${progress}%` }}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-foreground opacity-20" />
          </div>

          {/* Destination dot */}
          <div className="absolute -right-1 h-2.5 w-2.5 rounded-full border-2 border-muted bg-surface" />

          {/* Progress percentage label */}
          <span
            className="absolute -bottom-4 text-[9px] font-medium text-muted-foreground transition-all duration-700"
            style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
          >
            {progress}%
          </span>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Arrival
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.arrivalDate}
          </p>
        </div>
      </div>

      {/* Customer, Price, Description, Weight */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Customer
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.customer}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Price
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.price}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Description
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.description}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Weight
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {pkg.weight}
          </p>
        </div>
      </div>

      {/* Driver Section */}
      {pkg.driver && (
        <div className="mt-4 flex items-center justify-between rounded-[12px] bg-surface-alt p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neon-amber to-neon-red">
              <span className="text-[10px] font-bold text-white">
                {pkg.driver
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-muted">Driver</p>
              <p className="text-xs font-semibold text-foreground">
                {pkg.driver}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:+33600000000`}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-foreground text-background transition-all duration-200 hover:scale-105 hover:shadow-lg"
              aria-label="Call driver"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
            <button
              onClick={() => {
                // TODO: Open chat window / messaging system
                console.log("Opening chat with", pkg.driver);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-foreground text-background transition-all duration-200 hover:scale-105 hover:shadow-lg"
              aria-label="Message driver"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Expand/Collapse Timeline Button */}
      {pkg.events && pkg.events.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] py-2 text-xs font-medium text-muted hover:bg-surface-alt hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              Hide Timeline <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Timeline ({pkg.events.length} events) <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}

      {/* Timeline View */}
      {isExpanded && pkg.events && pkg.events.length > 0 && (
        <div className="mt-4 animate-fade-in border-t border-border pt-4">
          <div className="space-y-6 pl-2">
            {pkg.events.map((event: any, idx: number) => (
              <div key={idx} className="relative flex gap-4">
                {/* Timeline Line */}
                {idx !== pkg.events.length - 1 && (
                  <div className="absolute left-[7px] top-6 h-[calc(100%-8px)] w-[2px] bg-border" />
                )}
                {/* Timeline Dot */}
                <div className="relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-surface mt-1" />
                
                <div className="flex flex-col pb-2">
                  <span className="text-xs font-bold text-foreground">{event.status || "UPDATE"}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{event.description}</span>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted">
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </span>
                    )}
                    {event.timestamp && (
                      <span>{new Date(event.timestamp).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
