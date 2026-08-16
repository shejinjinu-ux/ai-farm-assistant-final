import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Radio } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, Gauge, PageHeader, StatusPill, MetricBar, Disclaimer } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER, historySeries } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sensors")({
  head: () => pageMeta("Soil & Sensor Readings", "NPK, moisture, pH, temperature and environment readings from your farm, explained in simple terms."),
  component: Sensors,
});

function Sensors() {
  const { sensors, simulate, lastReading } = useFarm();
  const npk = sensors.filter((s) => s.group === "npk");
  const soil = sensors.filter((s) => s.group === "soil");
  const env = sensors.filter((s) => s.group === "environment");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soil & Sensor Readings"
        subtitle={`Last reading: ${lastReading}`}
        badge={<DemoBadge />}
        action={
          <Button
            className="h-11 rounded-full font-bold"
            onClick={() => {
              simulate();
              toast.success("New sensor reading simulated");
            }}
          >
            <RefreshCw className="h-4 w-4" /> Simulate New Reading
          </Button>
        }
      />

      <Card className="gap-5 p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Nutrients (NPK)</h2>
          <Badge variant="secondary" className="rounded-full">Kg per hectare</Badge>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {npk.map((s) => (
            <div key={s.key} className="flex flex-col items-center gap-3 rounded-2xl bg-secondary/45 p-5">
              <Gauge value={s.value} max={s.max} size={124} tone={s.status === "optimal" ? "leaf" : s.status === "moderate" ? "warn" : "primary"} label={String(s.value)} sub={s.unit} />
              <p className="font-display text-base font-extrabold">{s.label}</p>
              <StatusPill status={s.status} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Soil conditions</h2>
          <div className="space-y-4">
            {soil.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <MetricBar label={s.label} value={s.value} max={s.max} unit={s.unit} tone={s.status === "optimal" ? "leaf" : s.status === "moderate" ? "warn" : "primary"} />
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="gap-4 p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Around the field</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {env.map((s) => (
              <div key={s.key} className="rounded-2xl bg-secondary/45 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-xl font-extrabold">
                  {s.value.toLocaleString("en-IN")} <span className="text-xs font-semibold text-muted-foreground">{s.unit}</span>
                </p>
                <div className="mt-2">
                  <StatusPill status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Moisture & nutrient trend</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historySeries["7d"]}>
              <defs>
                <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Area type="monotone" dataKey="moisture" name="Moisture %" stroke="var(--chart-2)" fill="url(#gm)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="npk" name="Nutrient index" stroke="var(--chart-1)" fill="url(#gn)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="flex-row items-center gap-4 border-dashed p-5 shadow-none">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary">
          <Radio className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-bold">Real IoT Sensor Integration – Coming Soon</p>
          <p className="text-xs text-muted-foreground">This screen is already wired to a data layer, so live sensors can replace the simulation without redesign.</p>
        </div>
      </Card>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
