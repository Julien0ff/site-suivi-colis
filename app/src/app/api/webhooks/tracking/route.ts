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

export async function POST(request: NextRequest) {
  try {
    const payload: AfterShipWebhookPayload = await request.json();

    if (payload.event !== "tracking_update") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const tracking = payload.msg;
    const trackingNumber = tracking.tracking_number;

    console.log(
      `[Webhook] Received update for ${trackingNumber}: ${tracking.tag}`
    );

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
      const newStatus = (STATUS_MAP[tracking.tag] || "IN_TRANSIT").toLowerCase();
      const previousStatus = existingPackage.status;

      if (newStatus === previousStatus) {
        continue;
      }

      const latestCheckpoint = tracking.checkpoints?.[0];

      // Update package
      await doc.ref.update({
        status: newStatus,
        currentCoords: latestCheckpoint?.coordinates ? {
          lat: latestCheckpoint.coordinates.latitude,
          lng: latestCheckpoint.coordinates.longitude
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
            origin:
              tracking.origin_city ||
              tracking.origin_country_iso3 ||
              existingPackage.origin,
            destination:
              tracking.destination_city ||
              tracking.destination_country_iso3 ||
              existingPackage.destination,
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
