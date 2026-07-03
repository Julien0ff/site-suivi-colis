// ═══════════════════════════════════════════════════════════
// Types & Interfaces for the TrackFlow application
// ═══════════════════════════════════════════════════════════

export type PackageStatus =
  | "packed"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "exception";

export interface TrackingEvent {
  id: string;
  status: PackageStatus;
  description: string;
  location: string;
  timestamp: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Package {
  id: string;
  trackingNumber: string;
  status: PackageStatus;
  origin: string;
  destination: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number };
  courierId: string;
  courierName: string;
  courierIcon?: string;
  weight: string;
  price: string;
  description: string;
  customer: string;
  driver?: string;
  driverAvatar?: string;
  departureDate: string;
  arrivalDate: string;
  events: TrackingEvent[];
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

export const STATUS_CONFIG: Record<
  PackageStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  packed: {
    label: "Packed",
    color: "text-neon-purple",
    bgColor: "bg-neon-purple-bg",
    dotColor: "bg-neon-purple",
  },
  in_transit: {
    label: "In Transit",
    color: "text-neon-green",
    bgColor: "bg-neon-green-bg",
    dotColor: "bg-neon-green",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-neon-amber",
    bgColor: "bg-neon-amber-bg",
    dotColor: "bg-neon-amber",
  },
  delivered: {
    label: "Delivered",
    color: "text-neon-blue",
    bgColor: "bg-neon-blue-bg",
    dotColor: "bg-neon-blue",
  },
  returned: {
    label: "Returned",
    color: "text-neon-red",
    bgColor: "bg-neon-red-bg",
    dotColor: "bg-neon-red",
  },
  exception: {
    label: "Exception",
    color: "text-neon-red",
    bgColor: "bg-neon-red-bg",
    dotColor: "bg-neon-red",
  },
};
