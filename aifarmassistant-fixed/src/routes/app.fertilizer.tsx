import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, PageHeader, Gauge, Disclaimer, StatusPill } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/fertilizer")({
  head: () => pageMeta("Fertilizer Optimization", "Compare current NPK with target levels and see suggested nutrient adjustments for your crop."),
  component: Fertilizer,
});

const targets: Record<string, number> = { n: 95, p: 52, k: 62 };

function Fertilizer() {
  const { sensors, crop } = useFarm();
  const npk = sensors.filter((s) => s.group === "npk");
  const chart = npk.map((s) => ({ name: s.label, current: s.value, target: targets[s.key] }));

  return (
    <div className="space-y-6">
      <PageHeader title="Fertilizer Optimization" subtitle={`Nutrient balance for ${crop.emoji} ${crop.name}`} badge={<DemoBadge label="Demo nutrient analysis" />} />

      <div className="grid gap-4 sm:grid-cols-3">
        {npk.map((s) => {
          const target = targets[s.key];
          const diff = Number((target - s.value).toFixed(1));
          return (
            <Card key={s.key} className="items-center gap-3 p-5 text-center shadow-card">
              <Badge variant="secondary" className="rounded-full">{s.label}</Badge>
              <Gauge value={s.value} max={target * 1.5} size={140} tone={diff > 10 ? "warn" : "leaf"} label={String(s.value)} sub={`target ${target} ${s.unit}`} />
              <StatusPill status={s.status} />
              <p className="text-sm font-semibold">
                {diff > 0 ? `${diff} ${s.unit} below target` : `${Math.abs(diff)} ${s.unit} above target`}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Current vs recommended</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} unit=" kg" />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Legend />
              <Bar dataKey="current" name="Current reading" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" name="Recommended" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: "🌿", title: "Nitrogen support", text: "A light split application works better than one heavy dose during humid weeks. Wait until the rain window closes." },
          { icon: "🧪", title: "Phosphorus", text: "Phosphorus is the furthest from target. Organic compost plus a phosphate source is commonly used at this stage." },
          { icon: "🍃", title: "Potassium", text: "Potassium is close to comfortable. Hold current practice and re-check after the next reading." },
        ].map((c) => (
          <Card key={c.title} className="gap-2 p-5 shadow-card">
            <span aria-hidden className="text-2xl">{c.icon}</span>
            <p className="font-display text-base font-bold">{c.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
          </Card>
        ))}
      </div>

      <Disclaimer text={"AI suggestions here are preliminary. " + DISCLAIMER} />
    </div>
  );
}
