import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Droplets, Wind, ThermometerSun, CloudRain } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader, StatCard } from "@/components/farm/ui-bits";
import { forecast, weatherNow } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/weather")({
  head: () => pageMeta("Smart Weather Center", "Current conditions, 7-day forecast and an AI weather insight tied to your irrigation plan."),
  component: Weather,
});

function Weather() {
  return (
    <div className="space-y-6">
      <PageHeader title="Smart Weather Center" subtitle="Forecast connected to your irrigation decisions" badge={<DemoBadge label="Demo Weather Data" />} />

      <Card className="gradient-hero gap-6 border-transparent p-6 text-forest-foreground shadow-lift">
        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div>
            <p className="font-display text-6xl font-extrabold leading-none">{weatherNow.temp}°C</p>
            <p className="mt-2 text-lg font-bold">⛅ {weatherNow.condition}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: <Droplets className="h-4 w-4" />, label: "Humidity", value: `${weatherNow.humidity}%` },
              { icon: <CloudRain className="h-4 w-4" />, label: "Rain chance", value: `${weatherNow.rainProb}%` },
              { icon: <CloudRain className="h-4 w-4" />, label: "Rainfall 24h", value: `${weatherNow.rainfall} mm` },
              { icon: <Wind className="h-4 w-4" />, label: "Wind", value: `${weatherNow.wind} km/h` },
            ].map((x) => (
              <div key={x.label} className="rounded-2xl bg-white/12 p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">{x.icon} {x.label}</p>
                <p className="mt-1 font-display text-lg font-extrabold">{x.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white/12 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-forest-foreground/80">AI Weather Insight</p>
            <p className="mt-1 text-sm">{weatherNow.insight}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ThermometerSun className="h-5 w-5 text-warn" />} label="Warmest day" value="35°C Saturday" hint="Plan field work early" />
        <StatCard icon={<CloudRain className="h-5 w-5 text-sky" />} label="Heaviest rain" value="22.4 mm Tuesday" hint="88% probability" />
        <StatCard icon={<Droplets className="h-5 w-5 text-primary" />} label="Week rainfall" value="39.5 mm" hint="Above weekly need" />
      </div>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">7-day forecast</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {forecast.map((d) => (
            <div key={d.day} className="rounded-2xl bg-secondary/45 p-4 text-center transition-transform hover:-translate-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{d.day}</p>
              <p aria-hidden className="mt-2 text-3xl">{d.icon}</p>
              <p className="mt-2 font-display text-base font-extrabold">{d.max}° / {d.min}°</p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{d.condition}</p>
              <p className="mt-1 text-[11px] font-bold text-sky">💧 {d.rainProb}%</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Expected rainfall this week</h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} unit=" mm" />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="rainfall" name="Rainfall (mm)" fill="var(--chart-3)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
