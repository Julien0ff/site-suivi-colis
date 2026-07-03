// ═══════════════════════════════════════════════════════════
// Tracking Service — Abstraction Layer
// Supports: AfterShip, Ship24, TrackingMore
// ═══════════════════════════════════════════════════════════

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  courierCode: string;
  courierName: string;
  origin: string;
  destination: string;
  currentLocation?: string;
  currentCoords?: { lat: number; lng: number };
  estimatedDelivery?: string;
  events: TrackingEventResult[];
}

export interface TrackingEventResult {
  status: string;
  description: string;
  location: string;
  timestamp: string;
  coordinates?: { lat: number; lng: number };
}

// ── Provider Interface ───────────────────────────────────

interface TrackingProvider {
  name: string;
  trackPackage(trackingNumber: string): Promise<TrackingResult>;
  detectCourier(trackingNumber: string): Promise<string | null>;
}

// ── AfterShip Provider ───────────────────────────────────

class AfterShipProvider implements TrackingProvider {
  name = "AfterShip";
  private apiKey: string;
  private baseUrl = "https://api.aftership.com/v4";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async trackPackage(trackingNumber: string): Promise<TrackingResult> {
    const response = await fetch(
      `${this.baseUrl}/trackings/${trackingNumber}`,
      {
        headers: {
          "aftership-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `AfterShip API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const tracking = data.data.tracking;

    return {
      trackingNumber: tracking.tracking_number,
      status: this.normalizeStatus(tracking.tag),
      courierCode: tracking.slug,
      courierName: tracking.courier_destination_country_iso3 || tracking.slug,
      origin: tracking.origin_city || tracking.origin_country_iso3 || "",
      destination:
        tracking.destination_city ||
        tracking.destination_country_iso3 ||
        "",
      currentLocation:
        tracking.checkpoints?.[0]?.city ||
        tracking.checkpoints?.[0]?.country_name ||
        "",
      estimatedDelivery: tracking.expected_delivery,
      events: (tracking.checkpoints || []).map(
        (cp: Record<string, unknown>) => ({
          status: this.normalizeStatus(cp.tag as string),
          description: cp.message as string,
          location: `${cp.city || ""}, ${cp.country_name || ""}`.trim(),
          timestamp: cp.checkpoint_time as string,
          coordinates:
            cp.coordinates
              ? {
                  lat: (cp.coordinates as Record<string, number>).latitude,
                  lng: (cp.coordinates as Record<string, number>).longitude,
                }
              : undefined,
        })
      ),
    };
  }

  async detectCourier(trackingNumber: string): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/couriers/detect`, {
      method: "POST",
      headers: {
        "aftership-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracking: { tracking_number: trackingNumber },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const couriers = data.data.couriers;
    return couriers?.[0]?.slug || null;
  }

  private normalizeStatus(aftershipTag: string): string {
    const statusMap: Record<string, string> = {
      Pending: "PACKED",
      InfoReceived: "PACKED",
      InTransit: "IN_TRANSIT",
      OutForDelivery: "OUT_FOR_DELIVERY",
      AttemptFail: "EXCEPTION",
      Delivered: "DELIVERED",
      AvailableForPickup: "OUT_FOR_DELIVERY",
      Exception: "EXCEPTION",
      Expired: "EXCEPTION",
    };
    return statusMap[aftershipTag] || "IN_TRANSIT";
  }
}

// ── TrackingMore Provider ────────────────────────────────

class TrackingMoreProvider implements TrackingProvider {
  name = "TrackingMore";
  private apiKey: string;
  private baseUrl = "https://api.trackingmore.com/v4";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async trackPackage(trackingNumber: string): Promise<TrackingResult> {
    const response = await fetch(
      `${this.baseUrl}/trackings/get?tracking_numbers=${trackingNumber}`,
      {
        headers: {
          "Tracking-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TrackingMore API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const tracking = data.data?.[0]; // TrackingMore returns an array in data

    if (!tracking) {
      throw new Error("No tracking data found in TrackingMore response");
    }

    return {
      trackingNumber: tracking.tracking_number,
      status: this.normalizeStatus(tracking.delivery_status),
      courierCode: tracking.courier_code,
      courierName: tracking.courier_code,
      origin: tracking.origin_country || "",
      destination: tracking.destination_country || "",
      currentLocation: "",
      estimatedDelivery: tracking.delivery_date || "",
      events: (tracking.tracking_details || []).map(
        (cp: any) => ({
          status: this.normalizeStatus(cp.status || tracking.delivery_status),
          description: cp.status_description || cp.status_info,
          location: cp.location || "",
          timestamp: cp.checkpoint_date,
        })
      ),
    };
  }

  async detectCourier(trackingNumber: string): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/couriers/detect`, {
      method: "POST",
      headers: {
        "Tracking-Api-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const couriers = data.data;
    return couriers?.[0]?.courier_code || null;
  }

  private normalizeStatus(tag: string): string {
    const lowerTag = tag?.toLowerCase() || "";
    if (lowerTag.includes("pending") || lowerTag.includes("notfound")) return "PACKED";
    if (lowerTag.includes("transit")) return "IN_TRANSIT";
    if (lowerTag.includes("pickup") || lowerTag.includes("outfordelivery")) return "OUT_FOR_DELIVERY";
    if (lowerTag.includes("delivered")) return "DELIVERED";
    if (lowerTag.includes("exception") || lowerTag.includes("undelivered")) return "EXCEPTION";
    return "IN_TRANSIT";
  }
}


// ── Tracking Service (Facade) ────────────────────────────

class TrackingService {
  private providers: TrackingProvider[] = [];

  constructor() {
    // Initialize providers based on available API keys
    if (process.env.AFTERSHIP_API_KEY) {
      this.providers.push(
        new AfterShipProvider(process.env.AFTERSHIP_API_KEY)
      );
    }

    // Add more providers here:
    // if (process.env.SHIP24_API_KEY) {
    //   this.providers.push(new Ship24Provider(process.env.SHIP24_API_KEY));
    // }
    if (process.env.TRACKINGMORE_API_KEY) {
      this.providers.push(new TrackingMoreProvider(process.env.TRACKINGMORE_API_KEY));
    }
  }

  /**
   * Track a package using the first available provider.
   * Falls back to the next provider if one fails.
   */
  async track(trackingNumber: string): Promise<TrackingResult> {
    if (this.providers.length === 0) {
      throw new Error(
        "No tracking providers configured. Set at least one API key in .env"
      );
    }

    for (const provider of this.providers) {
      try {
        console.log(
          `[Tracking] Trying ${provider.name} for ${trackingNumber}...`
        );
        const result = await provider.trackPackage(trackingNumber);
        console.log(
          `[Tracking] ${provider.name} returned status: ${result.status}`
        );
        return result;
      } catch (error) {
        console.warn(
          `[Tracking] ${provider.name} failed for ${trackingNumber}:`,
          error
        );
        continue;
      }
    }

    throw new Error(
      `All tracking providers failed for ${trackingNumber}`
    );
  }

  /**
   * Detect the courier for a tracking number.
   */
  async detectCourier(trackingNumber: string): Promise<string | null> {
    for (const provider of this.providers) {
      try {
        const courier = await provider.detectCourier(trackingNumber);
        if (courier) return courier;
      } catch {
        continue;
      }
    }
    return null;
  }
}

// Singleton
export const trackingService = new TrackingService();
