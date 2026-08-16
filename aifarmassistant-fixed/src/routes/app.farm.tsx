import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, PageHeader, Gauge } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { currentStageIndex, daysCompleted, growthStages } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";
import farmMapImg from "@/assets/farm-map.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import soilImg from "@/assets/soil.jpg";

export const Route = createFileRoute("/app/farm")({
  head: () => pageMeta("My Farm", "Your farm profile, crop growth journey and stage-by-stage insights for the season."),
  component: MyFarm,
});

function MyFarm() {
  const { farm, crop, soil, areaLabel, areaHa } = useFarm();
  const total = growthStages[growthStages.length - 1].days;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Farm"
        subtitle="Everything the assistant knows about your field"
        badge={<DemoBadge label="Demo Farm Profile" />}
        action={
          <Button asChild variant="secondary" className="h-11 rounded-full font-bold">
            <Link to="/setup">Edit farm setup</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Farm details</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ["Farmer", farm.farmerName],
              ["Farm name", farm.farmName],
              ["Mobile", farm.mobile],
              ["Village", farm.village],
              ["District", `${farm.district}, ${farm.state}`],
              ["Area", `${areaLabel} (${areaHa} ha)`],
              ["Crop", `${crop.emoji} ${crop.name} · ${crop.season}`],
              ["Soil", `${soil.name} — ${soil.note}`],
              ["Season price (demo)", `₹${crop.price.toLocaleString("en-IN")} ${crop.unit}`],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0 rounded-2xl bg-secondary/50 p-3.5">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="relative overflow-hidden p-0 shadow-card">
          <img src={farmMapImg} width={1200} height={900} loading="lazy" alt="Aerial view of the farm plots" className="h-full min-h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-forest/35" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-display text-lg font-extrabold text-forest-foreground">{farm.farmName}</p>
            <p className="text-sm text-forest-foreground/85">{areaLabel} · 4 zones monitored</p>
            <Button asChild size="sm" variant="secondary" className="mt-3 rounded-full font-bold">
              <Link to="/app/map">Open Farm Map</Link>
            </Button>
          </div>
        </Card>
      </div>

      <Card className="gap-5 p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Crop Growth Journey</h2>
            <p className="text-sm text-muted-foreground">
              Day {daysCompleted} of about {total} days · Current stage: <b>{growthStages[currentStageIndex].label}</b>
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full">Demo timeline</Badge>
        </div>

        <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Gauge value={daysCompleted} max={total} size={132} tone="leaf" label={`${Math.round((daysCompleted / total) * 100)}%`} sub="season complete" />
          <ol className="space-y-0">
            {growthStages.map((s, i) => {
              const done = i < currentStageIndex;
              const active = i === currentStageIndex;
              return (
                <li key={s.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-base transition-colors",
                        active ? "gradient-leaf text-forest shadow-card" : done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {s.icon}
                    </span>
                    {i < growthStages.length - 1 && <span className={cn("w-0.5 flex-1", done ? "bg-primary" : "bg-muted")} />}
                  </div>
                  <div className={cn("min-w-0 pb-5", !done && !active && "opacity-60")}>
                    <p className="text-sm font-bold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {active ? `In progress · started around day ${s.days}` : done ? `Completed around day ${s.days}` : `Expected around day ${s.days}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={cropRice} width={1024} height={700} loading="lazy" alt="Healthy crop leaves" className="h-36 w-full object-cover" />
            <p className="absolute inset-x-0 bottom-0 bg-forest/80 p-3 text-xs font-semibold text-forest-foreground">
              Crop insight: leaf colour is even — a good sign at the vegetative stage.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img src={soilImg} width={1024} height={700} loading="lazy" alt="Farm soil in hands" className="h-36 w-full object-cover" />
            <p className="absolute inset-x-0 bottom-0 bg-forest/80 p-3 text-xs font-semibold text-forest-foreground">
              Soil insight: {soil.name} soil holds moisture well — check depth 15 cm before watering.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
