import { PackageStatus, STATUS_CONFIG } from "@/lib/types";

interface StatusBadgeProps {
  status: PackageStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] font-medium ${config.bgColor} ${config.color} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotColor} animate-pulse-neon`}
      />
      {config.label}
    </span>
  );
}
