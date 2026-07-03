import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

// ═══════════════════════════════════════════════════════════
// Settings API — Manage user preferences (e.g., Discord DMs)
// ═══════════════════════════════════════════════════════════

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = (session.user as any).discordId;
  if (!discordId) {
    return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
  }

  try {
    const userDoc = await adminDb.collection("users").doc(discordId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userDoc.data();
    return NextResponse.json({
      discordDmEnabled: data?.discordDmEnabled || false,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = (session.user as any).discordId;
  if (!discordId) {
    return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { discordDmEnabled } = body;

    if (typeof discordDmEnabled !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await adminDb.collection("users").doc(discordId).update({
      discordDmEnabled,
    });

    return NextResponse.json({ success: true, discordDmEnabled });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
