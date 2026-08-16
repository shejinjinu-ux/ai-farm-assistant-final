import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Bot, Camera, ImagePlus, Mic, Send, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemoBadge, PageHeader } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

type Message = { role: "user" | "assistant"; text: string };

export const Route = createFileRoute("/app/assistant")({
  head: () => pageMeta("AI Farm Assistant", "Ask questions about your crop, soil, irrigation and farm decisions."),
  component: AIAssistant,
});

function AIAssistant() {
  const { farm, crop, soil, sensors, areaLabel } = useFarm();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Hello ${farm.farmerName}! I am your AI Farm Assistant. Ask me about your ${crop.name}, soil, irrigation, yield or farm costs.` },
  ]);
  const [input, setInput] = useState("");
  const [imageName, setImageName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const answer = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes("soil")) return `Your selected soil is ${soil.name}. Current demo moisture is ${sensors.find((s) => s.key === "moisture")?.value ?? 42}%. NPK and moisture should be monitored regularly.`;
    if (q.includes("irrig")) return "The demo weather data shows rain is expected tomorrow, so unnecessary irrigation can potentially be reduced. Check the live moisture reading before watering.";
    if (q.includes("yield")) return `The current demo yield prediction is 4.8 tons/hectare for ${crop.name}. This is a simulated AI prediction, not a confirmed harvest result.`;
    if (q.includes("improve")) return "Focus on balanced nutrients, timely irrigation, crop scouting and using the weather forecast before field operations.";
    if (q.includes("area") || q.includes("farm")) return `Your demo farm is ${farm.farmName}, ${areaLabel}, in ${farm.district}, ${farm.state}.`;
    return "I can help with soil health, NPK, irrigation, weather, yield prediction, fertilizer planning, crop disease images and farm economics.";
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: answer(text) }]);
    setInput("");
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const startVoice = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => { start: () => void; onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null } }).SpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((m) => [...m, { role: "assistant", text: "Voice input is not supported by this browser. You can use the text box instead." }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Farm Assistant" subtitle="Ask your farm anything" badge={<DemoBadge label="AI Demo Assistant" />} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex min-h-[600px] flex-col overflow-hidden p-0 shadow-card">
          <div className="flex items-center gap-3 border-b p-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary"><Bot className="h-6 w-6 text-primary" /></span>
            <div><p className="font-display font-bold">Farm AI Chat</p><p className="text-xs text-muted-foreground">Demo responses using your current farm context</p></div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/60"}`}>{m.text}<button className="ml-2 inline-flex align-middle opacity-70 hover:opacity-100" onClick={() => speak(m.text)} aria-label="Read aloud"><Volume2 className="h-3.5 w-3.5" /></button></div></div>)}
          </div>
          {imageName && <div className="mx-4 mb-2 rounded-xl bg-secondary p-2 text-xs">Attached: {imageName} — image analysis demo is ready for backend/AI integration.</div>}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageName(e.target.files?.[0]?.name ?? "")} />
              <Button variant="secondary" size="icon" onClick={() => fileRef.current?.click()} aria-label="Upload image"><ImagePlus className="h-4 w-4" /></Button>
              <Button variant="secondary" size="icon" onClick={() => fileRef.current?.click()} aria-label="Take photo"><Camera className="h-4 w-4" /></Button>
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about your farm..." />
              <Button variant="secondary" size="icon" onClick={startVoice} aria-label="Voice input"><Mic className="h-4 w-4" /></Button>
              <Button size="icon" onClick={send} aria-label="Send"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>

        <Card className="h-fit gap-4 p-5 shadow-card">
          <h2 className="font-display text-lg font-bold">Your farm context</h2>
          <div className="space-y-2 text-sm">
            {[["Crop", crop.name], ["Soil", soil.name], ["Area", areaLabel], ["NPK", sensors.filter((s) => s.group === "npk").map((s) => s.value).join(" / ")], ["Moisture", `${sensors.find((s) => s.key === "moisture")?.value ?? 42}%`], ["pH", `${sensors.find((s) => s.key === "ph")?.value ?? 6.5}`]].map(([k,v]) => <div key={k} className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3"><span className="text-muted-foreground">{k}</span><b>{v}</b></div>)}
          </div>
          <p className="text-xs text-muted-foreground">Image disease detection, real AI chat and multilingual voice can be connected to backend services later.</p>
        </Card>
      </div>
    </div>
  );
}
