import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HelpCircle, CalendarClock, Package, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, Gauge, PageHeader, MetricBar, StatCard, Disclaimer } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER, yieldFactors, yieldHistory } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/yield")({
  head: () => pageMeta("AI Crop Yield Prediction", "Predicted yield, confidence, harvest window and the factors that shape your season's production."),
  component: YieldPage,
});

function YieldPage() {
  const { crop, areaHa } = useFarm();
  const [why, setWhy] = useState(false);
  const predicted = 4.8;
  const total = (predicted * areaHa).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Crop Yield Prediction" subtitle={`${crop.emoji} ${crop.name} · ${areaHa} hectares`} badge={<DemoBadge label="Demo AI Prediction" />} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="items-center gap-4 p-6 text-center shadow-card">
          <Badge variant="secondary" className="rounded-full">Predicted Yield</Badge>
          <Gauge value={predicted} max={8} size={190} tone="leaf" label={`${predicted}`} sub="tons / hectare" thickness={14} />
          <p className="font-display text-lg font-extrabold">87% Prediction Confidence</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Based on your current soil, nutrient, moisture and weather readings for this season.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard icon={<Package className="h-5 w-5 text-primary" />} label="Total estimated production" value={`${total} tons`} hint={`${areaHa} ha`} />
          <StatCard icon={<CalendarClock className="h-5 w-5 text-earth" />} label="Expected harvest" value="in 72 days" hint="Mid-season estimate" />
          <StatCard icon={<Sparkles className="h-5 w-5 text-leaf" />} label="Best-case yield" value="5.3 t/ha" hint="With balanced nutrients" />
          <StatCard icon={<Sparkles className="h-5 w-5 text-warn" />} label="If nothing changes" value="4.5 t/ha" hint="Low moisture risk" />
        </div>
      </div>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Past seasons vs this prediction</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="season" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} unit=" t" />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Legend />
              <Line type="monotone" dataKey="actual" name="Actual harvest" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="predicted" name="AI prediction" stroke="var(--chart-2)" strokeWidth={3} strokeDasharray="6 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="gap-4 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">What affects your yield?</h2>
          <Button variant="secondary" className="rounded-full font-bold" onClick={() => setWhy((v) => !v)}>
            <HelpCircle className="h-4 w-4" /> Why did AI predict this?
          </Button>
        </div>

        {why && (
          <div className="rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed">
            <p className="font-bold">In simple words</p>
            <p className="mt-1.5 text-muted-foreground">
              Your field has good soil and a healthy crop stage, and rainfall this week is helpful. Two things hold the number
              back: soil moisture is on the lower side at 42%, and nitrogen is a little below the comfortable range. The
              assistant compared your readings with how similar fields performed and settled on 4.8 tons per hectare. If you
              fix moisture and nitrogen, the estimate moves closer to 5.2–5.3.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {yieldFactors.map((f) => (
            <div key={f.label} className="space-y-1.5 rounded-2xl bg-secondary/40 p-4">
              <MetricBar label={f.label} value={f.weight} max={30} unit="%" tone={f.weight > 20 ? "leaf" : "primary"} />
              <p className="text-xs text-muted-foreground">{f.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
