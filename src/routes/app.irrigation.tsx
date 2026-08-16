import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Sparkles, Waves } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, PageHeader, StatCard, Gauge, Disclaimer } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER, weatherNow } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";
import irrigationImg from "@/assets/irrigation.jpg";

export const Route = createFileRoute("/app/irrigation")({
  head: () => pageMeta("Smart Irrigation", "Water requirement, rain-aware irrigation advice and a simulated optimized watering schedule."),
  component: Irrigation,
});

const compare = [
  { day: "Mon", current: 1600, optimized: 1200 },
  { day: "Tue", current: 1600, optimized: 0 },
  { day: "Wed", current: 1600, optimized: 400 },
  { day: "Thu", current: 1600, optimized: 1100 },
  { day: "Fri", current: 1600, optimized: 1500 },
  { day: "Sat", current: 1600, optimized: 1500 },
  { day: "Sun", current: 1600, optimized: 1300 },
];

function Irrigation() {
  const { sensor, areaLabel } = useFarm();
  const moisture = sensor("moisture");
  const [optimized, setOptimized] = useState(false);

  const schedule = [
    { when: "Today, 6:00 AM", amount: "1,200 L", note: "Short run before the rain window" },
    { when: "Tomorrow", amount: "Skip", note: "22 mm rainfall expected" },
    { when: "Wednesday, 6:30 AM", amount: "400 L", note: "Top-up only for Zone D" },
    { when: "Friday, 6:00 AM", amount: "1,500 L", note: "Full cycle, dry and sunny" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Irrigation"
        subtitle={`${areaLabel} · rain-aware watering plan`}
        badge={<DemoBadge label="Simulated irrigation plan" />}
        action={
          <Button
            className="h-11 rounded-full font-bold"
            onClick={() => {
              setOptimized(true);
              toast.success("AI optimized schedule generated");
            }}
          >
            <Sparkles className="h-4 w-4" /> Optimize Irrigation
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Droplets className="h-5 w-5 text-sky" />} label="Current moisture" value={`${moisture.value}%`} hint="Moderate" />
        <StatCard icon={<Waves className="h-5 w-5 text-primary" />} label="Water requirement" value="1,200 L" hint="Next cycle" />
        <StatCard icon={<Droplets className="h-5 w-5 text-warn" />} label="Rain probability" value={`${weatherNow.rainProb}%`} hint="Next 24h" />
        <StatCard tone="hero" icon={<Sparkles className="h-5 w-5" />} label="Water saving potential" value="18%" hint="This week" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="gap-4 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Current vs AI optimized irrigation</h2>
            <Badge variant="secondary" className="rounded-full">Litres per day</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compare}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend />
                <Bar dataKey="current" name="Current practice" fill="var(--chart-5)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="optimized" name="AI optimized" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">
            Weekly water: 11,200 L currently vs 9,000 L optimized — about 2,200 L saved without stressing the crop.
          </p>
        </Card>

        <Card className="items-center gap-4 p-5 text-center shadow-card">
          <Badge variant="secondary" className="rounded-full">Recommended water</Badge>
          <Gauge value={1200} max={2000} size={168} tone="sky" label="1,200 L" sub="next cycle" thickness={13} />
          <p className="text-sm text-muted-foreground">
            Give a short cycle this morning, then let tomorrow's rainfall do the rest.
          </p>
        </Card>
      </div>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">{optimized ? "AI optimized schedule" : "Suggested schedule"}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {schedule.map((s) => (
            <li key={s.when} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-secondary/45 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{s.when}</p>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </div>
              <span className="shrink-0 font-display text-base font-extrabold text-primary">{s.amount}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="relative overflow-hidden rounded-3xl shadow-card">
        <img src={irrigationImg} width={1024} height={700} loading="lazy" alt="Sprinkler irrigating a green field" className="h-52 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 to-forest/10" />
        <p className="absolute inset-y-0 left-0 flex max-w-md items-center p-6 font-display text-lg font-extrabold text-forest-foreground">
          Watering with the weather instead of against it is the single biggest saving on most farms.
        </p>
      </div>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
