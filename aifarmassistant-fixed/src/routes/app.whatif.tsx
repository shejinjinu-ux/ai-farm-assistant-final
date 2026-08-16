import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, Droplets, IndianRupee, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DemoBadge, PageHeader, StatCard, Disclaimer } from "@/components/farm/ui-bits";
import { DISCLAIMER } from "@/lib/mock-data";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/whatif")({
  head: () => pageMeta("What-If Analysis", "Move nutrient, water and weather sliders to explore how your yield, water use and profit could change."),
  component: WhatIf,
});

const BASE = { n: 0, p: 0, k: 0, moisture: 0, irrigation: 0, rainfall: 0, temperature: 0, fertilizer: 0 };
type Knobs = typeof BASE;

const SLIDERS: { key: keyof Knobs; label: string; icon: string }[] = [
  { key: "n", label: "Nitrogen", icon: "🌿" },
  { key: "p", label: "Phosphorus", icon: "🧪" },
  { key: "k", label: "Potassium", icon: "🍃" },
  { key: "moisture", label: "Soil Moisture", icon: "💧" },
  { key: "irrigation", label: "Irrigation", icon: "🚿" },
  { key: "rainfall", label: "Rainfall", icon: "🌧️" },
  { key: "temperature", label: "Temperature", icon: "🌡️" },
  { key: "fertilizer", label: "Fertilizer", icon: "🧴" },
];

const SCENARIOS: { name: string; knobs: Partial<Knobs>; note: string }[] = [
  { name: "Current Practice", knobs: {}, note: "Your readings exactly as they are today" },
  { name: "Balanced Nutrients", knobs: { n: 15, p: 20, fertilizer: 10 }, note: "Bring N and P closer to target" },
  { name: "Optimized Irrigation", knobs: { moisture: 12, irrigation: -20 }, note: "Less water, better timing" },
  { name: "Weather Scenario", knobs: { rainfall: 25, temperature: 6 }, note: "A wetter, warmer week" },
];

const BASE_YIELD = 4.8;

function WhatIf() {
  const { crop, areaHa } = useFarm();
  const [k, setK] = useState<Knobs>({ ...BASE });

  const result = useMemo(() => {
    const yieldDelta =
      k.n * 0.02 + k.p * 0.012 + k.k * 0.008 + k.moisture * 0.014 + k.rainfall * 0.006 - Math.abs(k.temperature) * 0.01 + k.fertilizer * 0.006;
    const newYield = Math.max(1.5, Number((BASE_YIELD + yieldDelta).toFixed(2)));
    const waterDelta = k.irrigation + k.moisture * 0.6 - k.rainfall * 0.5;
    const revenue = newYield * areaHa * 10 * crop.price;
    const baseRevenue = BASE_YIELD * areaHa * 10 * crop.price;
    return {
      newYield,
      yieldPct: Number((((newYield - BASE_YIELD) / BASE_YIELD) * 100).toFixed(1)),
      waterPct: Number(waterDelta.toFixed(1)),
      revenue: Math.round(revenue),
      revenuePct: Number((((revenue - baseRevenue) / baseRevenue) * 100).toFixed(1)),
    };
  }, [k, areaHa, crop.price]);

  const changed = SLIDERS.filter((s) => k[s.key] !== 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="What If? – Explore Better Farming Decisions"
        subtitle="Move a slider and watch the estimated outcome change"
        badge={<DemoBadge label="AI Simulation / Demo Prediction" />}
        action={
          <Button variant="secondary" className="h-11 rounded-full font-bold" onClick={() => setK({ ...BASE })}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<TrendingUp className="h-5 w-5 text-leaf" />} label="Yield change" value={`${result.newYield} t/ha`} hint={`${result.yieldPct > 0 ? "+" : ""}${result.yieldPct}% vs today`} />
        <StatCard icon={<Droplets className="h-5 w-5 text-sky" />} label="Water change" value={`${result.waterPct > 0 ? "+" : ""}${result.waterPct}%`} hint="vs current watering" />
        <StatCard tone="hero" icon={<IndianRupee className="h-5 w-5" />} label="Revenue change" value={`₹${result.revenue.toLocaleString("en-IN")}`} hint={`${result.revenuePct > 0 ? "+" : ""}${result.revenuePct}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="gap-5 p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Adjust the conditions</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">
                    <span aria-hidden className="mr-1">{s.icon}</span>
                    {s.label}
                  </span>
                  <span className="font-display text-sm font-extrabold text-primary">
                    {k[s.key] > 0 ? "+" : ""}
                    {k[s.key]}%
                  </span>
                </div>
                <Slider className="mt-3" min={-30} max={30} step={1} value={[k[s.key]]} onValueChange={([v]) => setK((prev) => ({ ...prev, [s.key]: v }))} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="gap-3 p-5 shadow-card">
            <h2 className="font-display text-lg font-bold">Scenario cards</h2>
            <div className="grid gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.name}
                  onClick={() => setK({ ...BASE, ...sc.knobs })}
                  className={cn("rounded-2xl border-2 border-border p-3.5 text-left transition-all hover:border-primary/50 hover:bg-secondary/50")}
                >
                  <p className="text-sm font-bold">{sc.name}</p>
                  <p className="text-xs text-muted-foreground">{sc.note}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="gap-3 p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Scenario summary</h2>
              <Badge variant="secondary" className="rounded-full">Demo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Current yield <b className="text-foreground">{BASE_YIELD} t/ha</b> → scenario{" "}
              <b className="text-primary">{result.newYield} t/ha</b> for {crop.name}.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {changed.length === 0 ? (
                <li>No changes yet — move a slider or pick a scenario card.</li>
              ) : (
                changed.map((c) => (
                  <li key={c.key}>
                    {c.label} {k[c.key] > 0 ? "+" : ""}
                    {k[c.key]}%
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
