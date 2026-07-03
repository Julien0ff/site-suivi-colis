import Link from "next/link";
import { Hexagon, ArrowRight, Package, Bell, Map, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // If user is already logged in, redirect them to dashboard
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-foreground">
            <Hexagon className="h-5 w-5 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold uppercase tracking-widest text-foreground">
            TrackFlow
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-[var(--radius-button)] bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-background transition-transform hover:scale-105 hover:bg-neon-green hover:text-background"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="animate-fade-in relative max-w-3xl">
          {/* Subtle neon glow behind the title */}
          <div className="absolute -inset-x-20 top-1/2 -z-10 h-48 -translate-y-1/2 bg-neon-green/10 blur-[100px]" />
          
          <h1 className="text-5xl font-black uppercase tracking-tight text-foreground sm:text-7xl">
            Track Your <span className="text-neon-green">Parcels</span>
            <br /> With Precision.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            TrackFlow brings order to chaos. Monitor your shipments in real-time on an interactive map, and get Discord notifications instantly when statuses change.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group flex items-center gap-3 rounded-[var(--radius-button)] bg-neon-green px-8 py-4 text-sm font-bold uppercase tracking-widest text-background shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid max-w-5xl grid-cols-1 gap-8 text-left sm:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-colors hover:border-neon-green/50">
            <Map className="mb-4 h-8 w-8 text-neon-green" />
            <h3 className="text-base font-bold uppercase tracking-wide text-foreground">Live Map</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Visualize your shipments on a gorgeous interactive map. Track their progress with accurate coordinates.
            </p>
          </div>
          
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-colors hover:border-neon-purple/50">
            <Bell className="mb-4 h-8 w-8 text-neon-purple" />
            <h3 className="text-base font-bold uppercase tracking-wide text-foreground">Discord DMs</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Connect your Discord account and get instant notifications directly in your DMs when a package moves.
            </p>
          </div>
          
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card transition-colors hover:border-neon-blue/50">
            <Shield className="mb-4 h-8 w-8 text-neon-blue" />
            <h3 className="text-base font-bold uppercase tracking-wide text-foreground">Secure & Fast</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Built on Next.js and Firebase. Lightning fast, modern, and completely secure for all your data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TrackFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
