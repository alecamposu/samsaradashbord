import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: "up" | "down" | "flat";
  className?: string;
  accent?: "default" | "success" | "warning" | "destructive";
};

const accentMap = {
  default: "bg-card",
  success: "bg-card",
  warning: "bg-card",
  destructive: "bg-card",
} as const;

export function StatCard({
  label,
  value,
  hint,
  className,
  accent = "default",
}: Props) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 p-6 transition hover:border-foreground/20",
        accentMap[accent],
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 font-display text-4xl font-semibold tracking-tight num">
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-sm text-muted-foreground num">{hint}</div>
      )}
    </div>
  );
}
