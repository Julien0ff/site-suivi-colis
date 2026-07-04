"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePackages } from "@/contexts/PackageContext";

export default function AddPackageForm() {
  const { addPackage } = usePackages();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierId, setCourierId] = useState("auto");
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = trackingNumber.trim();
    if (!value) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      await addPackage(value, courierId === "auto" ? undefined : courierId, { description: description.trim() || undefined });
      setFeedback({ type: "success", message: `Added ${value}` });
      setTrackingNumber("");
      setCourierId("auto");
      setDescription("");
      // Clear feedback after 3s
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to add package",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-gradient overflow-hidden rounded-[var(--radius-card)] p-5 transition-shadow duration-300 hover:shadow-card-hover">
      <h3 className="text-sm font-semibold text-foreground">
        Add new package
      </h3>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Fill out the form and create new package
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <div
          className={`flex w-full items-center rounded-[var(--radius-input)] border bg-surface px-3.5 py-2.5 transition-all duration-200 ${
            isFocused
              ? "border-foreground shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
              : "border-border"
          }`}
        >
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Tracking Number"
            className="w-full flex-1 bg-transparent text-xs font-medium text-foreground placeholder:text-muted outline-none"
            disabled={isLoading}
          />
        </div>

        <div className="flex w-full items-center rounded-[var(--radius-input)] border border-border bg-surface px-3.5 py-2.5 transition-all duration-200">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (e.g., iPhone 15 Pro)"
            className="w-full flex-1 bg-transparent text-xs font-medium text-foreground placeholder:text-muted outline-none"
            disabled={isLoading}
          />
          <select
            value={courierId}
            onChange={(e) => setCourierId(e.target.value)}
            className="ml-2 border-l border-border bg-transparent pl-2 text-[10px] font-medium text-foreground outline-none"
            disabled={isLoading}
          >
            <option value="auto">Auto-detect API</option>
            <option value="amazon">Amazon (Manual)</option>
            <option value="manual">Other (Manual)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!trackingNumber.trim() || isLoading}
          className="group flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-input)] bg-foreground text-xs font-bold text-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          aria-label="Add package"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
          ) : (
            <>
              Add Package
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </>
          )}
        </button>
      </form>

      {/* Feedback message */}
      {feedback && (
        <p
          className={`mt-2 text-[11px] font-medium animate-fade-in ${
            feedback.type === "success" ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {feedback.type === "success" ? "✓" : "✗"} {feedback.message}
        </p>
      )}
    </div>
  );
}
