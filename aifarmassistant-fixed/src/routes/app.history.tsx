import { createFileRoute } from "@tanstack/react-router";
import { Activity, Droplets, Sprout, CloudSun } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader, StatCard } from "@/components/farm/ui-bits";
import { historySeries, yieldHistory } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/history")({
  head: () => pageMeta("Farm History", "Historical yield, sensor, irrigation and weather records for your demo farm."),
  component: FarmHistory,
});

function FarmHistory() {
  return (
    <div className="space-y-6">
      <PageHeader title="Farm History" subtitle="See how your farm indicators have changed over time" badge={<DemoBadge label="Demo Historical Data" />} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Sprout className="h-5 w-5 text-leaf" />} label="Yield records" value="6" hint="Seasons" />
        <StatCard icon={<Activity className="h-5 w-5 text-primary" />} label="Sensor readings" value="42" hint="Recent samples" />
        <StatCard icon={<Droplets className="h-5 w-5 text-sky" />} label="Irrigation events" value="18" hint="This season" />
        <StatCard icon={<CloudSun className="h-5 w-5 text-warn" />} label="Weather checks" value="21" hint="Recent" />
      </div>
      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Sensor trend — last 7 days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historySeries["7d"]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="moisture" name="Moisture" stroke="var(--chart-2)" strokeWidth={3} />
              <Line type="monotone" dataKey="nitrogen" name="Nitrogen" stroke="var(--chart-1)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Yield history</h2>
        <div className="divide-y rounded-2xl border">
          {yieldHistory.map((row) => <div key={row.season} className="flex items-center justify-between gap-3 p-4 text-sm"><span className="font-semibold">{row.season}</span><span className="text-muted-foreground">Actual: {row.actual ?? "—"} t/ha</span><b>Prediction: {row.predicted} t/ha</b></div>)}
        </div>
      </Card>
      <Card className="gap-3 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Recent activity</h2>
        {["Sensor reading simulated", "AI irrigation recommendation reviewed", "Weather alert checked", "Disease scouting reminder created"].map((item, i) => <div key={item} className="flex gap-3 rounded-xl bg-secondary/50 p-3 text-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs">{i + 1}</span><span>{item}</span></div>)}
      </Card>
    </div>
  );
}
