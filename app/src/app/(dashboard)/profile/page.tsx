"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Hash } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Profile Page
// ═══════════════════════════════════════════════════════════

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="flex h-full w-full flex-col px-8 pb-6 pt-6">
      <h2 className="text-lg font-bold text-foreground">Profile</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Manage your personal information.
      </p>

      <div className="mt-8 max-w-2xl">
        <div className="flex items-center gap-6 rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-card">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Avatar"
              className="h-24 w-24 rounded-full border-4 border-background shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-border-subtle text-muted">
              <User className="h-10 w-10" />
            </div>
          )}

          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="truncate text-xl font-bold text-foreground">
              {session?.user?.name || "Unknown User"}
            </h3>
            
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{session?.user?.email || "No email provided"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4 shrink-0" />
              <span className="truncate">ID: {(session?.user as any)?.discordId || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
