// ═══════════════════════════════════════════════════════════
// Discord Notification Service
// Sends rich embeds to a Discord user via Direct Message
// ═══════════════════════════════════════════════════════════

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface PackageNotification {
  discordId: string;
  trackingNumber: string;
  previousStatus: string;
  newStatus: string;
  origin: string;
  destination: string;
  courierName: string;
  customer?: string;
}

// Status-based embed colors (Discord uses decimal color values)
const STATUS_COLORS: Record<string, number> = {
  added: 0x6366f1, // Indigo
  packed: 0xa855f7, // Purple
  in_transit: 0x22c55e, // Green
  out_for_delivery: 0xf59e0b, // Amber
  delivered: 0x3b82f6, // Blue
  returned: 0xef4444, // Red
  exception: 0xef4444, // Red
};

const STATUS_EMOJIS: Record<string, string> = {
  added: "🆕",
  packed: "📦",
  in_transit: "🚚",
  out_for_delivery: "🏃",
  delivered: "✅",
  returned: "↩️",
  exception: "⚠️",
};

/**
 * Send a formatted Discord embed notification when a package status changes.
 */
export async function sendDiscordNotification(
  notification: PackageNotification
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    console.warn(
      "[Discord] DISCORD_BOT_TOKEN is not set. Skipping notification."
    );
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackingUrl = `${appUrl}/tracking/${notification.trackingNumber}`;

  const emoji = STATUS_EMOJIS[notification.newStatus.toLowerCase()] || "📦";
  const color = STATUS_COLORS[notification.newStatus.toLowerCase()] || 0x737373;

  const fields: DiscordEmbedField[] = [
    {
      name: "📋 Tracking Number",
      value: `\`${notification.trackingNumber}\``,
      inline: true,
    },
    {
      name: "🚛 Courier",
      value: notification.courierName,
      inline: true,
    },
    {
      name: "📍 Route",
      value: `${notification.origin} → ${notification.destination}`,
      inline: false,
    },
  ];

  if (notification.previousStatus && notification.previousStatus !== "none") {
    fields.push({
      name: "⏮️ Previous Status",
      value: `~~${notification.previousStatus.toUpperCase()}~~`,
      inline: true,
    });
  }

  fields.push({
    name: `${emoji} New Status`,
    value: `**${notification.newStatus.toUpperCase()}**`,
    inline: true,
  });

  if (notification.customer) {
    fields.push({
      name: "👤 Customer",
      value: notification.customer,
      inline: true,
    });
  }

  const embed = {
    title: notification.newStatus === "added" ? "🆕 Package Added" : `${emoji} Package Status Update`,
    description: notification.newStatus === "added" 
      ? `You are now tracking package **${notification.trackingNumber}**.` 
      : `Package **${notification.trackingNumber}** has changed status.`,
    color,
    fields,
    footer: {
      text: "TrackFlow — Package Tracking Dashboard",
    },
    timestamp: new Date().toISOString(),
    url: trackingUrl,
  };

  try {
    // 1. Create a DM channel with the user
    const channelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        "Authorization": `Bot ${botToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recipient_id: notification.discordId })
    });

    if (!channelRes.ok) {
      console.error("[Discord] Failed to create DM channel", await channelRes.text());
      return false;
    }

    const channel = await channelRes.json();
    const channelId = channel.id;

    // 2. Send the message to the DM channel
    const messageRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${botToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!messageRes.ok) {
      console.error("[Discord] Failed to send DM", await messageRes.text());
      return false;
    }

    console.log(
      `[Discord] DM Notification sent for ${notification.trackingNumber}`
    );
    return true;
  } catch (error) {
    console.error("[Discord] Error sending DM:", error);
    return false;
  }
}
