import { useState } from "react";
import type { Period } from "@/lib/analytics";

export function PeriodFilter({
  value,
  onChange,
}: {
  value: Period;
  onChange: (v: Period) => void;
}) {
  const opts: { v: Period; label: string }[] = [
    { v: "all", label: "Todo" },
    { v: "weekly", label: "Semanales" },
    { v: "monthly", label: "Mensuales" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={
            "rounded-full px-4 py-1.5 transition " +
            (value === o.v
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DateRangeFilter({
  from,
  to,
  min,
  max,
  onChange,
}: {
  from: string;
  to: string;
  min: string;
  max: string;
  onChange: (from: string, to: string) => void;
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={localFrom}
        min={min}
        max={max}
        onChange={(e) => {
          setLocalFrom(e.target.value);
          onChange(e.target.value, localTo);
        }}
        className="rounded-md border border-border bg-card px-3 py-1.5 num text-foreground"
      />
      <span className="text-muted-foreground">→</span>
      <input
        type="date"
        value={localTo}
        min={min}
        max={max}
        onChange={(e) => {
          setLocalTo(e.target.value);
          onChange(localFrom, e.target.value);
        }}
        className="rounded-md border border-border bg-card px-3 py-1.5 num text-foreground"
      />
    </div>
  );
}
