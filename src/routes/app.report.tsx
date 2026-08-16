import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge, PageHeader } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { weatherNow } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/report")({
  head: () => pageMeta("Farm Report", "A printable summary of your demo farm, soil, weather, yield, recommendations and economics."),
  component: FarmReport,
});

function FarmReport() {
  const { farm, crop, soil, sensors, areaLabel, areaHa } = useFarm();
  const yieldValue = 4.8;
  const production = yieldValue * areaHa;
  const revenue = Math.round(production * 1000 * crop.price);
  const cost = Math.round(areaHa * 34000);
  const profit = revenue - cost;
  const npk = sensors.filter((s) => s.group === "npk").map((s) => `${s.label}: ${s.value} ${s.unit}`).join(" · ");

  const printReport = () => window.print();

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      <PageHeader title="Farm Report" subtitle="A single summary of your current demo farm analysis" badge={<DemoBadge label="Demo Report" />} action={<div className="flex gap-2"><Button variant="secondary" className="rounded-full" onClick={printReport}><Printer className="h-4 w-4" /> Print</Button><Button className="rounded-full" onClick={printReport}><Download className="h-4 w-4" /> Download / Save PDF</Button></div>} />
      <Card id="farm-report" className="gap-6 p-6 shadow-card print:border-0 print:shadow-none">
        <div className="flex items-center gap-3 border-b pb-5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary"><FileText className="h-6 w-6 text-primary" /></span><div><h2 className="font-display text-2xl font-extrabold">AI Farm Assistant — Farm Report</h2><p className="text-sm text-muted-foreground">{farm.farmName} · {farm.district}, {farm.state}</p></div></div>
        <Section title="Farm details" items={[["Farmer", farm.farmerName], ["Farm area", `${areaLabel} (${areaHa} ha)`], ["Crop", crop.name], ["Soil", soil.name]]} />
        <Section title="Soil & sensor summary" items={[["NPK", npk], ["Moisture", `${sensors.find((s) => s.key === "moisture")?.value ?? 42}%`], ["pH", `${sensors.find((s) => s.key === "ph")?.value ?? 6.5}`], ["Temperature", `${sensors.find((s) => s.key === "temperature")?.value ?? 32}°C`]]} />
        <Section title="Weather" items={[["Current temperature", `${weatherNow.temp}°C`], ["Humidity", `${weatherNow.humidity}%`], ["Rain probability", `${weatherNow.rainProb}%`], ["Rainfall (24h)", `${weatherNow.rainfall} mm`]]} />
        <Section title="AI analysis" items={[["Predicted yield", `${yieldValue} t/ha`], ["Expected production", `${production.toFixed(2)} tons`], ["Farm health", "84 / 100"], ["Irrigation", "Monitor moisture and reduce watering before expected rain"]]} />
        <Section title="Economics" items={[["Estimated revenue", `₹${revenue.toLocaleString("en-IN")}`], ["Estimated cost", `₹${cost.toLocaleString("en-IN")}`], ["Estimated profit", `₹${profit.toLocaleString("en-IN")}`]]} />
        <div className="rounded-2xl border border-leaf/30 bg-leaf/10 p-4 text-sm"><b>Recommendations:</b> monitor moisture, review nitrogen after the rain window, scout lower leaves for disease symptoms, and use the weather forecast before irrigation.</div>
        <p className="text-xs text-muted-foreground">This report contains simulated/demo values. It should not be treated as a confirmed agronomic or financial assessment.</p>
      </Card>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[][] }) {
  return <section><h3 className="font-display text-lg font-bold">{title}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{items.map(([key, value]) => <div key={key} className="rounded-2xl bg-secondary/50 p-3.5"><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{key}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div></section>;
}
