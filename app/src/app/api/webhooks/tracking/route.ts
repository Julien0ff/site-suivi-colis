import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendDiscordNotification } from "@/lib/discord/notifier";

// ═══════════════════════════════════════════════════════════
// POST /api/webhooks/tracking
// Receives status updates from AfterShip webhooks
// Updates the database and sends Discord notifications
// ═══════════════════════════════════════════════════════════

interface AfterShipWebhookPayload {
  event: string;
  msg: {
    tracking_number: string;
    slug: string;
    tag: string;
    title: string;
    subtag: string;
    checkpoints: Array<{
      tag: string;
      message: string;
      city: string;
      country_name: string;
      checkpoint_time: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    }>;
    origin_city?: string;
    origin_country_iso3?: string;
    destination_city?: string;
    destination_country_iso3?: string;
  };
}

const STATUS_MAP: Record<string, string> = {
  // AfterShip
  Pending: "PACKED",
  InfoReceived: "PACKED",
  InTransit: "IN_TRANSIT",
  OutForDelivery: "OUT_FOR_DELIVERY",
  AttemptFail: "EXCEPTION",
  Delivered: "DELIVERED",
  AvailableForPickup: "OUT_FOR_DELIVERY",
  Exception: "EXCEPTION",
  Expired: "EXCEPTION",
  // TrackingMore
  pending: "PACKED",
  notfound: "PACKED",
  transit: "IN_TRANSIT",
  pickup: "OUT_FOR_DELIVERY",
  outfordelivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  undelivered: "EXCEPTION",
  exception: "EXCEPTION",
  expired: "EXCEPTION",
};

export async function POST(request: NextRequest) {
  try {
    const payload: any = await request.json();

    let trackingNumber: string;
    let tag: string;
    let originCity: string | undefined;
    let originCountry: string | undefined;
    let destCity: string | undefined;
    let destCountry: string | undefined;
    let coords: { latitude: number; longitude: number } | undefined;

    // Check if it's AfterShip webhook
    if (payload.event === "tracking_update" && payload.msg) {
      const tracking = payload.msg;
      trackingNumber = tracking.tracking_number;
      tag = tracking.tag;
      originCity = tracking.origin_city;
      originCountry = tracking.origin_country_iso3;
      destCity = tracking.destination_city;
      destCountry = tracking.destination_country_iso3;
      coords = tracking.checkpoints?.[0]?.coordinates;
      console.log(`[Webhook] Received AfterShip update for ${trackingNumber}: ${tag}`);
    } 
    // Check if it's TrackingMore webhook
    else if (payload.data && payload.data.tracking_number) {
      const tracking = payload.data;
      trackingNumber = tracking.tracking_number;
      tag = tracking.delivery_status;
      originCity = tracking.origin_city;
      originCountry = tracking.origin_country;
      destCity = tracking.destination_city;
      destCountry = tracking.destination_country;
      // Coordinates are not always present in TrackingMore webhook root, usually in trackinfo
      coords = undefined; 
      console.log(`[Webhook] Received TrackingMore update for ${trackingNumber}: ${tag}`);
    } else {
      return NextResponse.json({ message: "Event ignored or unknown payload" }, { status: 200 });
    }

    // Find the package in Firestore across all users
    const packagesSnapshot = await adminDb.collectionGroup("packages")
      .where("trackingNumber", "==", trackingNumber)
      .get();

    if (packagesSnapshot.empty) {
      console.warn(
        `[Webhook] Package ${trackingNumber} not found in database. Ignoring.`
      );
      return NextResponse.json(
        { message: "Package not tracked" },
        { status: 200 }
      );
    }

    // Process each user tracking this package
    for (const doc of packagesSnapshot.docs) {
      const existingPackage = doc.data();
      const newStatus = (STATUS_MAP[tag] || "IN_TRANSIT").toLowerCase();
      const previousStatus = existingPackage.status;

      if (newStatus === previousStatus) {
        continue;
      }

      // Update package
      await doc.ref.update({
        status: newStatus,
        currentCoords: coords ? {
          lat: coords.latitude,
          lng: coords.longitude
        } : null,
        updatedAt: new Date().toISOString()
      });

      // Get user settings for Discord DMs
      const userId = doc.ref.parent.parent?.id; // user doc id
      if (userId) {
        const userDoc = await adminDb.collection("users").doc(userId).get();
        if (userDoc.exists && userDoc.data()?.discordDmEnabled) {
          await sendDiscordNotification({
            discordId: userId,
            trackingNumber,
            previousStatus,
            newStatus,
            origin: originCity || originCountry || existingPackage.origin,
            destination: destCity || destCountry || existingPackage.destination,
            courierName: existingPackage.courierName,
            customer: existingPackage.customer || undefined,
          });
        }
      }
    }

    return NextResponse.json({
      message: "Status updated",
      trackingNumber,
    });
  } catch (error) {
    console.error("[Webhook] Error processing tracking update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
