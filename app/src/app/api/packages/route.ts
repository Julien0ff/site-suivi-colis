import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { trackingService } from "@/lib/tracking/service";
import { sendDiscordNotification } from "@/lib/discord/notifier";
import { auth } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════
// GET /api/packages — List all packages for the user
// POST /api/packages — Add a new package
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discordId = (session.user as any).discordId;
    if (!discordId) {
      return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("users")
      .doc(discordId)
      .collection("packages")
      .orderBy("updatedAt", "desc")
      .get();

    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("[API] Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discordId = (session.user as any).discordId;
    if (!discordId) {
      return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
    }

    const body = await request.json();
    const { trackingNumber } = body;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "trackingNumber is required" },
        { status: 400 }
      );
    }

    const packagesRef = adminDb.collection("users").doc(discordId).collection("packages");
    
    // Check if already tracked
    const existing = await packagesRef.where("trackingNumber", "==", trackingNumber).get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "Package already being tracked" },
        { status: 409 }
      );
    }

    // Try to detect courier and get initial tracking info
    let courierCode = body.courierId || "auto";
    let courierName = body.courierName || "Unknown Carrier";
    let status = "packed";
    let description = body.description || "New package";
    let events: any[] = [];

    if (courierCode === "amazon" || trackingNumber.toUpperCase().startsWith("TBA") || trackingNumber.toUpperCase().startsWith("FR")) {
      courierName = "Amazon Logistics";
      courierCode = "amazon";
      status = "in_transit";
      events = [
        {
          status: "Expédié",
          description: "Le colis a quitté les locaux de l'expéditeur",
          location: "Amazon Facility",
          timestamp: new Date().toISOString()
        }
      ];
    } else if (courierCode === "manual") {
      courierName = "Manual Entry";
    } else {
      try {
        const result = await trackingService.track(trackingNumber);
        courierCode = result.courierCode || courierCode;
        courierName = result.courierName || courierName;
        status = result.status || status;
      } catch {
        console.warn(
          `[API] Could not fetch tracking info for ${trackingNumber}. Adding with manual data.`
        );
      }
    }

    const newPkg = {
      trackingNumber,
      status,
      origin: body.origin || "—",
      destination: body.destination || "—",
      courierId: courierCode,
      courierName: courierName,
      weight: body.weight || "—",
      price: body.price || "—",
      description: description,
      customer: body.customer || "You",
      driver: body.driver || null,
      departureDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      arrivalDate: "—",
      events: events,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await packagesRef.add(newPkg);
    
    // Send Discord DM if enabled
    try {
      const userDoc = await adminDb.collection("users").doc(discordId).get();
      if (userDoc.exists && userDoc.data()?.discordDmEnabled) {
        await sendDiscordNotification({
          discordId,
          trackingNumber,
          previousStatus: "none",
          newStatus: "added",
          origin: newPkg.origin,
          destination: newPkg.destination,
          courierName: newPkg.courierName,
          customer: newPkg.customer,
        });
      }
    } catch (e) {
      console.warn("[API] Failed to send initial Discord DM", e);
    }

    return NextResponse.json({ package: { id: docRef.id, ...newPkg } }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discordId = (session.user as any).discordId;
    if (!discordId) {
      return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("users")
      .doc(discordId)
      .collection("packages")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
