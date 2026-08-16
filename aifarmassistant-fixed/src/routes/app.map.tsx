import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, MetricBar, PageHeader } from "@/components/farm/ui-bits";
import { farmZones } from "@/lib/mock-data";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";
import farmMapImg from "@/assets/farm-map.jpg";

export const Route = createFileRoute("/app/map")({
  head: () => pageMeta("Smart Farm Map", "Zone-by-zone view of your farm with moisture, nutrient status and crop health per section."),
  component: FarmMap,
});

const zoneTone: Record<string, string> = {
  healthy: "from-leaf/85 to-primary/85",
  attention: "from-warn/85 to-warn/60",
  critical: "from-destructive/85 to-destructive/60",
};
const zoneLabel: Record<string, string> = { healthy: "🟢 Healthy Zone", attention: "🟡 Attention Needed", critical: "🔴 Critical Zone" };

function FarmMap() {
  const { areaLabel } = useFarm();
  const [selected, setSelected] = useState(farmZones[0].id);
  const zone = farmZones.find((z) => z.id === selected)!;

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Farm Map" subtitle={`${areaLabel} split into 4 monitored zones`} badge={<DemoBadge label="Simulated zone data" />} />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="gap-4 p-5 shadow-card">
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
            {Object.values(zoneLabel).map((l) => <span key={l}>{l}</span>)}
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img src={farmMapImg} width={1200} height={900} loading="lazy" alt="Aerial farm plots" className="h-full w-full object-cover" />
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-2">
              {farmZones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelected(z.id)}
                  className={cn(
                    "relative flex flex-col justify-between rounded-2xl bg-gradient-to-br p-3 text-left transition-all",
                    zoneTone[z.status],
                    selected === z.id ? "ring-3 ring-forest-foreground/90 scale-[0.98]" : "hover:scale-[0.99]",
                  )}
                >
                  <span className="font-display text-sm font-extrabold text-forest-foreground">Zone {z.id}</span>
                  <span className="text-[11px] font-semibold text-forest-foreground/90">
                    {z.moisture}% moisture · {z.health}/100
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Tap a zone to inspect its readings. This is a frontend simulation of field-level monitoring.</p>
        </Card>

        <Card className="gap-4 p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">{zone.name}</h2>
            <Badge variant="secondary" className="rounded-full">{zoneLabel[zone.status]}</Badge>
          </div>
          <div className="space-y-4">
            <MetricBar label="Moisture" value={zone.moisture} unit="%" tone={zone.moisture > 45 ? "leaf" : "warn"} />
            <MetricBar label="Crop Health" value={zone.health} unit="/100" tone={zone.health > 80 ? "leaf" : "warn"} />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary/60 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">NPK</p>
                <p className="mt-1 font-display text-base font-extrabold">{zone.npk}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Zone area</p>
                <p className="mt-1 font-display text-base font-extrabold">{zone.area} acre</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border p-4 text-sm leading-relaxed">
              <p className="font-bold">What this means</p>
              <p className="mt-1 text-muted-foreground">
                {zone.status === "healthy"
                  ? "This zone is doing well. Keep the current watering rhythm and check again in three days."
                  : zone.status === "attention"
                    ? "Moisture is drifting low and nitrogen is on the weaker side here. Water this zone before the others."
                    : "This zone needs attention today — moisture is well below the comfortable range and nutrients are low."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
