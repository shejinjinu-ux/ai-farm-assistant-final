import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Languages, Mic, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DemoBadge, PageHeader } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";
import type { LanguageCode } from "@/lib/i18n";

export const Route = createFileRoute("/app/settings")({
  head: () => pageMeta("Settings", "Manage farmer profile, language, voice and notification preferences."),
  component: Settings,
});

function Settings() {
  const { farm, updateFarm, language, setLanguage, demoMode, setDemoMode } = useFarm();
  const [voiceInput, setVoiceInput] = useState(true);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [irrigationAlerts, setIrrigationAlerts] = useState(true);
  const [cropAlerts, setCropAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Personalize your AI Farm Assistant experience" badge={<DemoBadge label="Local Settings" />} />
      <Card className="gap-5 p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><UserRound className="h-5 w-5 text-primary" /> Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Farmer name</Label><Input className="mt-2" value={farm.farmerName} onChange={(e) => updateFarm({ farmerName: e.target.value })} /></div>
          <div><Label>Mobile number</Label><Input className="mt-2" value={farm.mobile} onChange={(e) => updateFarm({ mobile: e.target.value })} /></div>
          <div><Label>Location</Label><Input className="mt-2" value={`${farm.village}, ${farm.district}, ${farm.state}`} readOnly /></div>
          <div><Label>Farm name</Label><Input className="mt-2" value={farm.farmName} onChange={(e) => updateFarm({ farmName: e.target.value })} /></div>
        </div>
        <Button className="w-fit rounded-full" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save profile"}</Button>
      </Card>

      <Card className="gap-5 p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Languages className="h-5 w-5 text-primary" /> Language</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["en", "hi", "or", "ta"] as LanguageCode[]).map((code) => <button key={code} onClick={() => setLanguage(code)} className={`rounded-2xl border p-4 text-left font-semibold ${language === code ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>{code === "en" ? "English" : code === "hi" ? "Hindi" : code === "or" ? "Odia" : "Tamil"}</button>)}
        </div>
      </Card>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Mic className="h-5 w-5 text-primary" /> Voice</h2>
        <ToggleRow label="Voice input" description="Use microphone input where browser support is available" checked={voiceInput} onCheckedChange={setVoiceInput} />
        <ToggleRow label="Voice output" description="Read AI responses aloud" checked={voiceOutput} onCheckedChange={setVoiceOutput} />
      </Card>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Bell className="h-5 w-5 text-primary" /> Notifications</h2>
        <ToggleRow label="Weather alerts" checked={weatherAlerts} onCheckedChange={setWeatherAlerts} />
        <ToggleRow label="Irrigation alerts" checked={irrigationAlerts} onCheckedChange={setIrrigationAlerts} />
        <ToggleRow label="Crop alerts" checked={cropAlerts} onCheckedChange={setCropAlerts} />
        <ToggleRow label="AI recommendations" checked={true} onCheckedChange={() => undefined} />
      </Card>

      <Card className="gap-4 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Demo Mode</h2>
        <ToggleRow label="Demo sensor data" description="Use simulated sensor readings" checked={demoMode} onCheckedChange={setDemoMode} />
        <p className="text-xs text-muted-foreground">Real IoT sensors, weather APIs and AI services can replace these demo values when the backend is connected.</p>
      </Card>
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }: { label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/50 p-4"><div><p className="text-sm font-semibold">{label}</p>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div><Switch checked={checked} onCheckedChange={onCheckedChange} /></div>;
}
