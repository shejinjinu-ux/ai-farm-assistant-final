import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Droplets, CloudSun, HeartPulse, ArrowRight, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, Gauge, PageHeader, StatCard, Disclaimer, MetricBar } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER, healthBreakdown, recommendations, sustainability, weatherNow } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import cropRice from "@/assets/crop-rice.jpg";

export const Route = createFileRoute("/app/")({
  head: () => pageMeta("Farm Dashboard", "Farm health score, predicted yield, soil moisture, weather and today's AI action plan in one place."),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function Dashboard() {
  const { farm, crop, soil, areaLabel, sensor } = useFarm();
  const moisture = sensor("moisture");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${farm.farmerName} 👋`}
        subtitle={`${farm.farmName} · ${farm.village}, ${farm.district}, ${farm.state} · ${crop.emoji} ${crop.name} · ${areaLabel} · ${soil.name} soil`}
        badge={<DemoBadge label="Demo Mode – Simulated Farm Data" />}
        action={
          <Button asChild className="h-11 rounded-full font-bold">
            <Link to="/app/assistant">
              Ask the assistant <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="hero" icon={<HeartPulse className="h-5 w-5" />} label="Farm Health" value="84 / 100" hint="Healthy" />
        <StatCard icon={<Sparkles className="h-5 w-5 text-primary" />} label="Predicted Yield" value="4.8 t/ha" hint="87% confidence" />
        <StatCard icon={<Droplets className="h-5 w-5 text-sky" />} label="Soil Moisture" value={`${moisture.value}%`} hint="Moderate" />
        <StatCard icon={<CloudSun className="h-5 w-5 text-warn" />} label="Weather" value={`${weatherNow.temp}°C`} hint={weatherNow.condition} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="gap-5 p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">AI Farm Health Score</h2>
              <p className="text-sm text-muted-foreground">Farm Status: <b className="text-primary">Healthy</b></p>
            </div>
            <Badge variant="secondary" className="rounded-full">Demo AI Prediction</Badge>
          </div>
          <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
            <Gauge value={84} size={150} label="84" sub="out of 100" />
            <div className="space-y-3.5">
              {healthBreakdown.map((h) => (
                <MetricBar key={h.key} label={`${h.icon} ${h.label}`} value={h.value} tone={h.value >= 85 ? "leaf" : h.value >= 80 ? "primary" : "warn"} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="gap-4 p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Today's AI Action Plan</h2>
            <Link to="/app/recommendations" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {recommendations.slice(0, 4).map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-secondary/50 p-3.5 transition-colors hover:bg-secondary">
                <span aria-hidden className="text-lg leading-none">{r.icon}</span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {r.title}
                    <Badge variant={r.priority === "High" ? "destructive" : "outline"} className="rounded-full text-[10px]">{r.priority}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.action}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-3 p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sustainability Score</p>
          <div className="flex items-center gap-4">
            <Gauge value={sustainability.score} size={104} tone="leaf" label={String(sustainability.score)} sub="/ 100" thickness={9} />
            <p className="text-xs leading-relaxed text-muted-foreground">{sustainability.tip}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-0 shadow-card lg:col-span-2">
          <img src={cropRice} width={1024} height={700} loading="lazy" alt="Healthy green rice crop close up" className="h-full min-h-44 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/92 via-forest/60 to-forest/10" />
          <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6">
            <Leaf className="h-6 w-6 text-forest-foreground" />
            <p className="font-display text-xl font-extrabold text-forest-foreground">Crop looks healthy — vegetative stage, day 48</p>
            <p className="max-w-md text-sm text-forest-foreground/80">Flowering is expected in about 17 days. Keep moisture above 45% through this stage.</p>
            <Button asChild size="sm" variant="secondary" className="mt-2 w-fit rounded-full font-bold">
              <Link to="/app/farm">Open crop timeline</Link>
            </Button>
          </div>
        </Card>
      </div>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
