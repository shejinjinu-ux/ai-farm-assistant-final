import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Info, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { Status } from "@/lib/mock-data";

export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-leaf shadow-card">
        <Sprout className="h-5 w-5 text-forest-foreground" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-forest text-[8px] font-bold text-forest-foreground">
          AI
        </span>
      </span>
      <span className="min-w-0 leading-tight">
        <span className={cn("block truncate font-display text-[15px] font-extrabold uppercase tracking-tight", invert ? "text-forest-foreground" : "text-foreground")}>
          AI Farm Assistant
        </span>
        <span className={cn("block truncate text-[10px] font-medium", invert ? "text-forest-foreground/70" : "text-muted-foreground")}>
          Smarter Farming. Higher Yield.
        </span>
      </span>
    </span>
  );
}

export function DemoBadge({ label = "DEMO MODE – SIMULATED SENSOR DATA", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-leaf/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-leaf" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
      </span>
      {label}
    </span>
  );
}

const statusStyles: Record<Status, string> = {
  optimal: "bg-leaf/15 text-secondary-foreground border-leaf/40",
  moderate: "bg-warn/20 text-warn-foreground border-warn/50",
  critical: "bg-destructive/12 text-destructive border-destructive/40",
};
const statusDot: Record<Status, string> = { optimal: "🟢", moderate: "🟡", critical: "🔴" };
const statusText: Record<Status, string> = { optimal: "Optimal", moderate: "Moderate", critical: "Needs attention" };

export function StatusPill({ status, children }: { status: Status; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      <span aria-hidden>{statusDot[status]}</span>
      {children ?? statusText[status]}
    </span>
  );
}

export function Gauge({
  value,
  max = 100,
  size = 132,
  label,
  sub,
  tone = "primary",
  thickness = 11,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sub?: string;
  tone?: "primary" | "leaf" | "sky" | "warn";
  thickness?: number;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const strokes: Record<string, string> = {
    primary: "var(--primary)",
    leaf: "var(--leaf)",
    sky: "var(--sky)",
    warn: "var(--warn)",
  };
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokes[tone]}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-extrabold leading-none">{label ?? value}</div>
          {sub && <div className="mt-1 text-[11px] font-medium text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function MetricBar({ label, value, max = 100, unit, tone = "leaf" }: { label: string; value: number; max?: number; unit?: string; tone?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-medium">{label}</span>
        <span className="shrink-0 font-display font-bold">
          {value}
          {unit ? <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span> : null}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", tone === "leaf" ? "gradient-leaf" : tone === "warn" ? "bg-warn" : tone === "sky" ? "bg-sky" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "card",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "card" | "hero";
}) {
  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        tone === "hero" && "gradient-hero border-transparent text-forest-foreground",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl", tone === "hero" ? "bg-white/15" : "bg-secondary")}>{icon}</span>
        {hint && <span className={cn("text-[11px] font-semibold", tone === "hero" ? "text-forest-foreground/75" : "text-muted-foreground")}>{hint}</span>}
      </div>
      <p className={cn("mt-4 text-xs font-semibold uppercase tracking-wide", tone === "hero" ? "text-forest-foreground/75" : "text-muted-foreground")}>{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold leading-tight">{value}</p>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action, badge }: { title: string; subtitle?: string; action?: ReactNode; badge?: ReactNode }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        {badge && <div className="mt-3">{badge}</div>}
      </div>
      {action}
    </header>
  );
}

export function Disclaimer({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-earth/25 bg-earth/8 p-4 text-xs leading-relaxed text-muted-foreground">
      <span className="mt-0.5 shrink-0 text-earth">{icon ?? <Info className="h-4 w-4" />}</span>
      <p>{text}</p>
    </div>
  );
}
