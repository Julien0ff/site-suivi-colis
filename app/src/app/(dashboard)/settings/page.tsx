"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, ShieldAlert, Loader2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Settings Page
// ═══════════════════════════════════════════════════════════

export default function SettingsPage() {
  const { data: session } = useSession();
  const [dmEnabled, setDmEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current settings
    async function fetchSettings() {
      if (!session) return;
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setDmEnabled(!!data.discordDmEnabled);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [session]);

  const toggleDm = async () => {
    setSaving(true);
    const newValue = !dmEnabled;
    // Optimistic update
    setDmEnabled(newValue);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordDmEnabled: newValue }),
      });
      if (!res.ok) {
        // Revert on error
        setDmEnabled(!newValue);
      }
    } catch (err) {
      console.error("Failed to update settings", err);
      setDmEnabled(!newValue);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col px-8 pb-6 pt-6">
      <h2 className="text-lg font-bold text-foreground">Settings</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Configure your preferences and notifications.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Notifications Section */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-foreground">
              <Bell className="h-4 w-4" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading settings...
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Discord Direct Messages
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Receive tracking updates directly in your Discord DMs. The TrackFlow bot must share a server with you.
                  </p>
                </div>

                <button
                  onClick={toggleDm}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 ${
                    dmEnabled ? "bg-neon-green" : "bg-border"
                  } ${saving ? "opacity-50" : ""}`}
                  role="switch"
                  aria-checked={dmEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dmEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
            
            {/* Warning if enabled */}
            {dmEnabled && (
              <div className="mt-4 flex gap-3 rounded-lg border border-neon-amber/20 bg-neon-amber/5 p-3 text-neon-amber">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                  Make sure you allow Direct Messages from server members in your Discord Privacy Settings, otherwise the bot won't be able to message you.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legal Information Section */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
          <div className="border-b border-border p-5">
            <h3 className="font-semibold text-foreground">Informations Légales</h3>
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-4 sm:gap-8">
            <a href="/cgu" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4">Conditions Générales (CGU)</a>
            <a href="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4">Politique de Confidentialité</a>
            <a href="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4">Mentions Légales</a>
          </div>
        </div>
      </div>
    </div>
  );
}
