import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Crosshair, Ruler, ArrowRight, ArrowLeft, Check, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo, DemoBadge } from "@/components/farm/ui-bits";
import { LanguageSelector } from "@/components/farm/LanguageSelector";
import { useFarm } from "@/lib/farm-context";
import { AREA_UNITS, CROPS, DISTRICTS, SOILS, STATES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import farmMapImg from "@/assets/farm-map.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import soilImg from "@/assets/soil.jpg";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Farm Setup — Location, Area, Crop & Soil" },
      { name: "description", content: "Tell the assistant where your farm is, how big it is, and what you grow — then get AI insights." },
      { property: "og:title", content: "Farm Setup — AI Farm Assistant" },
      { property: "og:description", content: "Location, area, crop and soil in four quick steps." },
    ],
  }),
  component: SetupPage,
});

const STEPS = ["Farm Location", "Farm Area", "Crop", "Soil"];

function SetupPage() {
  const { farm, updateFarm, crop, soil } = useFarm();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const recommended = CROPS.filter((c) => soil.best.includes(c.id)).slice(0, 3);

  function next() {
    if (step === STEPS.length - 1) {
      updateFarm({ setupComplete: true });
      toast.success("Farm setup complete 🌱 Opening your dashboard");
      navigate({ to: "/app" });
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="min-h-screen gradient-soft pb-16">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="min-w-0">
            <Logo />
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <div className="mx-auto max-w-[1000px] px-4 pt-8 sm:px-6">
        <DemoBadge label="Step-by-step farm setup" />
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Let's set up your farm</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Location → Area → Crop → Soil. Sensor readings, weather and AI analysis unlock right after this.
        </p>

        <ol className="mt-7 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0">
              <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "gradient-leaf" : "bg-muted")} />
              <p className={cn("mt-2 truncate text-[11px] font-bold uppercase tracking-wide", i <= step ? "text-primary" : "text-muted-foreground")}>{s}</p>
            </li>
          ))}
        </ol>

        <Card className="mt-6 gap-6 p-5 shadow-card sm:p-7">
          {step === 0 && (
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <MapPin className="h-5 w-5 text-primary" /> Farm Location
                </h2>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={farm.state} onValueChange={(v) => updateFarm({ state: v, district: DISTRICTS[v][0] })}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={farm.district} onValueChange={(v) => updateFarm({ district: v })}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(DISTRICTS[farm.state] ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <div className="relative">
                    <Input id="village" value={farm.village} onChange={(e) => updateFarm({ village: e.target.value })} className="h-12 rounded-2xl pr-12" />
                    <button type="button" aria-label="Speak village name" onClick={() => toast("🎙️ Listening... (demo voice input)")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full gradient-leaf text-forest">
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Button variant="secondary" className="h-12 w-full rounded-2xl font-bold" onClick={() => toast.success("Location detected: " + farm.village + ", " + farm.district)}>
                  <Crosshair className="h-4 w-4" /> Use Current Location
                </Button>
              </div>
              <div className="relative overflow-hidden rounded-2xl">
                <img src={farmMapImg} width={1200} height={900} loading="lazy" alt="Aerial view of farm plots" className="h-full min-h-56 w-full object-cover" />
                <div className="absolute inset-0 bg-forest/25" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="glass rounded-2xl px-4 py-3 text-center">
                    <MapPin className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 font-display text-sm font-extrabold">{farm.village}</p>
                    <p className="text-[11px] text-muted-foreground">{farm.district}, {farm.state}</p>
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <Ruler className="h-5 w-5 text-primary" /> Farm Area
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="area">Farm Area</Label>
                  <Input id="area" type="number" step="0.1" min="0.1" value={farm.area} onChange={(e) => updateFarm({ area: Number(e.target.value) || 0 })} className="h-14 rounded-2xl text-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {AREA_UNITS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => updateFarm({ unit: u.id })}
                        className={cn(
                          "rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-all",
                          farm.unit === u.id ? "border-primary bg-secondary text-secondary-foreground" : "border-border hover:border-primary/40",
                        )}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="rounded-2xl bg-secondary/70 p-4 text-sm">
                  Your farm is about{" "}
                  <b>{(farm.area * (AREA_UNITS.find((u) => u.id === farm.unit)?.toHa ?? 1)).toFixed(2)} hectares</b>. All yield
                  and water numbers are calculated for this size.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mini farm map</p>
                <div className="mt-3 grid aspect-square grid-cols-3 grid-rows-3 gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg transition-all duration-500",
                        i % 4 === 0 ? "gradient-leaf" : i % 3 === 0 ? "bg-leaf/45" : "bg-primary/70",
                      )}
                      style={{ opacity: i / 12 + 0.5 }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Simulated plot layout for {farm.area} {farm.unit}(s) — used across Farm Map and irrigation planning.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold">Which crop are you growing?</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {CROPS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFarm({ cropId: c.id })}
                    className={cn(
                      "overflow-hidden rounded-2xl border-2 text-left transition-all hover:-translate-y-1",
                      farm.cropId === c.id ? "border-primary shadow-lift" : "border-border",
                    )}
                  >
                    <div className="relative h-20">
                      <img src={cropRice} width={1024} height={700} loading="lazy" alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-forest/45" />
                      <span aria-hidden className="absolute inset-0 grid place-items-center text-2xl">{c.emoji}</span>
                      {farm.cropId === c.id && (
                        <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full gradient-leaf text-forest">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.season}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">Soil type</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SOILS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateFarm({ soilId: s.id })}
                      className={cn(
                        "rounded-2xl border-2 p-3.5 text-left transition-all",
                        farm.soilId === s.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="text-sm font-bold">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.note}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={soilImg} width={1024} height={700} loading="lazy" alt="Farm soil held in hands with a seedling" className="h-40 w-full object-cover" />
                </div>
                <Card className="gap-2 bg-secondary/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recommended Crop</p>
                  <p className="font-display text-lg font-extrabold">
                    {recommended[0]?.emoji} {recommended[0]?.name ?? crop.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on {soil.name} soil and current demo conditions. Also suitable:{" "}
                    {recommended.slice(1).map((r) => r.name).join(", ") || "—"}.
                  </p>
                </Card>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t pt-5">
            {step > 0 && (
              <Button variant="ghost" className="h-12 rounded-2xl font-bold" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button className="h-12 flex-1 rounded-2xl text-base font-bold shadow-card sm:flex-none sm:px-8" onClick={next}>
              {step === STEPS.length - 1 ? "Open Dashboard" : "Continue"} <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
