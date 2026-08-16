import { createFileRoute } from "@tanstack/react-router";
import { IndianRupee, TrendingUp, ReceiptText, Wheat } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader, StatCard, Disclaimer } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/revenue")({
  head: () => pageMeta("Revenue & Profit", "Estimated farm revenue, costs and profit based on your demo crop and predicted yield."),
  component: Revenue,
});

function Revenue() {
  const { farm, crop, areaHa } = useFarm();
  const predictedYield = 4.8;
  const production = predictedYield * areaHa;
  const revenue = Math.round(production * 1000 * crop.price);
  const costs = {
    Seeds: Math.round(areaHa * 5200),
    Fertilizer: Math.round(areaHa * 11800),
    Irrigation: Math.round(areaHa * 7200),
    "Crop care": Math.round(areaHa * 5800),
    "Other costs": Math.round(areaHa * 4000),
  };
  const totalCost = Object.values(costs).reduce((sum, value) => sum + value, 0);
  const profit = revenue - totalCost;
  const costData = Object.entries(costs).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue & Profit" subtitle={`${farm.farmName} · ${crop.name} · ${areaHa} hectares`} badge={<DemoBadge label="Demo Estimate" />} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<IndianRupee className="h-5 w-5 text-leaf" />} label="Expected revenue" value={`₹${revenue.toLocaleString("en-IN")}`} hint="Estimated sales" />
        <StatCard icon={<ReceiptText className="h-5 w-5 text-earth" />} label="Total cost" value={`₹${totalCost.toLocaleString("en-IN")}`} hint="Estimated season cost" />
        <StatCard tone="hero" icon={<TrendingUp className="h-5 w-5" />} label="Estimated profit" value={`₹${profit.toLocaleString("en-IN")}`} hint="Revenue − cost" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Production estimate</h2>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <Wheat className="h-6 w-6 text-leaf" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Predicted yield</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{predictedYield} t/ha</p>
            <p className="mt-1 text-sm text-muted-foreground">{production.toFixed(2)} tons across {areaHa} ha</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo crop price</p>
            <p className="mt-1 font-display text-xl font-extrabold">₹{crop.price.toLocaleString("en-IN")} / {crop.unit}</p>
          </div>
        </Card>

        <Card className="gap-4 p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Cost breakdown</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Estimated season economics</h2>
        <div className="mt-4 divide-y rounded-2xl border">
          <div className="flex justify-between p-4 text-sm"><span>Expected revenue</span><b>₹{revenue.toLocaleString("en-IN")}</b></div>
          <div className="flex justify-between p-4 text-sm"><span>Total estimated cost</span><b>₹{totalCost.toLocaleString("en-IN")}</b></div>
          <div className="flex justify-between bg-secondary/50 p-4 text-sm"><span>Estimated profit</span><b className="text-primary">₹{profit.toLocaleString("en-IN")}</b></div>
        </div>
      </Card>

      <Disclaimer text="Revenue and profit figures are frontend demo estimates using simulated yield, crop price and cost assumptions. They are not a financial guarantee." />
    </div>
  );
}
